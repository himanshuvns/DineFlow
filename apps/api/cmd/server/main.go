package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	aiapp "github.com/dineflow/api/internal/application/ai"
	analyticsapp "github.com/dineflow/api/internal/application/analytics"
	authapp "github.com/dineflow/api/internal/application/auth"
	menuapp "github.com/dineflow/api/internal/application/menu"
	orderapp "github.com/dineflow/api/internal/application/order"
	subapp "github.com/dineflow/api/internal/application/subscription"
	tableapp "github.com/dineflow/api/internal/application/table"
	whatsappapp "github.com/dineflow/api/internal/application/whatsapp"
	emailinfra "github.com/dineflow/api/internal/infrastructure/email"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	realtimeinfra "github.com/dineflow/api/internal/infrastructure/realtime"
	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	storageinfra "github.com/dineflow/api/internal/infrastructure/storage"
	"github.com/dineflow/api/internal/interfaces/http/handlers"
	"github.com/dineflow/api/internal/interfaces/http/routes"
	"github.com/dineflow/api/pkg/config"
	"github.com/dineflow/api/pkg/logger"
	"github.com/dineflow/api/pkg/otp"
	"github.com/dineflow/api/pkg/token"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// buildTime is set at compile time via -ldflags to guarantee a unique binary per deploy.
var buildTime = "dev"

func main() {
	// ── Load Configuration ───────────────────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		panic("failed to load config: " + err.Error())
	}

	// ── Initialize Logger ────────────────────────────────────────────────────
	log := logger.New(cfg.App.Env)
	defer func() { _ = log.Sync() }()

	log.Info("Starting DineFlow API", zap.String("env", cfg.App.Env), zap.String("buildTime", buildTime))

	// ── Set Gin Mode ─────────────────────────────────────────────────────────
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// ── Background Context ────────────────────────────────────────────────────
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// ── Connect MongoDB ───────────────────────────────────────────────────────
	mongoDB, err := mongoinfra.New(ctx, cfg.MongoDB.URI, cfg.MongoDB.Database, log)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB", zap.Error(err))
	}
	defer func() {
		shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer shutdownCancel()
		_ = mongoDB.Disconnect(shutdownCtx)
	}()

	// Ensure all indexes exist (idempotent, non-fatal if disk threshold reached)
	if err := mongoDB.EnsureIndexes(ctx); err != nil {
		log.Warn("Failed to ensure some MongoDB indexes, continuing server start", zap.Error(err))
	}

	// Seed default / demo workspace and owner (idempotent)
	if err := seedDefaultData(ctx, mongoDB, log); err != nil {
		log.Warn("Failed to seed default data", zap.Error(err))
	}

	// ── Startup Disk Cleanup (non-fatal) ────────────────────────────────────
	// Removes orphaned tenants, stale unverified users, and compacts collections
	// to reclaim disk space on Railway's MongoDB volume.
	go func() {
		cleanCtx, cleanCancel := context.WithTimeout(context.Background(), 3*time.Minute)
		defer cleanCancel()
		if err := runStartupCleanup(cleanCtx, mongoDB, log); err != nil {
			log.Warn("Startup cleanup had errors (non-fatal)", zap.Error(err))
		}
	}()

	// ── Connect Redis ─────────────────────────────────────────────────────────
	rdb, err := redisinfra.New(ctx, cfg.Redis.URL, log)
	if err != nil {
		log.Fatal("Failed to connect to Redis", zap.Error(err))
	}
	defer func() { _ = rdb.Close() }()

	// ── Initialize Services ───────────────────────────────────────────────────
	tokenMaker := token.NewMaker(
		cfg.JWT.AccessSecret,
		cfg.JWT.RefreshSecret,
		cfg.JWT.AccessTTL,
		cfg.JWT.RefreshTTL,
	)

	otpProvider, err := otp.NewOTPProvider(otp.Config{
		Provider:        cfg.OTP.Provider,
		MSG91AuthKey:    cfg.OTP.MSG91AuthKey,
		MSG91TemplateID: cfg.OTP.MSG91TemplateID,
		MSG91SenderID:   cfg.OTP.MSG91SenderID,
		TestNumbers:     otp.ParseTestNumbers(cfg.OTP.TestNumbers),
	}, rdb.Raw())
	if err != nil {
		log.Fatal("Failed to initialize OTP provider", zap.Error(err))
	}
	log.Info("Initialized OTP Provider", zap.String("provider", otpProvider.Name()))

	emailService := emailinfra.NewService(
		cfg.Email.ResendAPIKey,
		cfg.Email.FromAddress,
		cfg.Email.FromName,
		"http://localhost:3000", // TODO: from config in production
	)

	authService := authapp.NewService(mongoDB, rdb, tokenMaker, otpProvider, emailService)

	// ── Initialize Handlers & Services ───────────────────────────────────────
	hub := realtimeinfra.GetHub()

	storageService := storageinfra.NewService(storageinfra.Config{
		Provider:      "mock",
		PublicBaseURL: "http://localhost:8080/assets",
	})

	menuService := menuapp.NewService(mongoDB)
	tableService := tableapp.NewService(mongoDB)
	orderService := orderapp.NewService(mongoDB, hub)
	subService := subapp.NewService(mongoDB)
	waService := whatsappapp.NewService(mongoDB)
	analyticsService := analyticsapp.NewService(mongoDB)
	aiService := aiapp.NewService(cfg.AI.GeminiAPIKey, mongoDB)

	authHandler := handlers.NewAuthHandler(authService)
	tenantHandler := handlers.NewTenantHandler()
	staffHandler := handlers.NewStaffHandler()
	storageHandler := handlers.NewStorageHandler(storageService)
	menuHandler := handlers.NewMenuHandler(menuService, aiService)
	tableHandler := handlers.NewTableHandler(tableService)
	orderHandler := handlers.NewOrderHandler(orderService, hub)
	subHandler := handlers.NewSubscriptionHandler(subService)
	waHandler := handlers.NewWhatsAppHandler(waService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	aiHandler := handlers.NewAIHandler(aiService)

	// Inject ping functions for health endpoint
	handlers.SetHealthDeps(
		func() error { return mongoDB.Ping(ctx) },
		func() error { return rdb.Ping(ctx) },
	)

	// ── Build Router ──────────────────────────────────────────────────────────
	r := gin.New()

	// Global middleware
	r.Use(gin.Recovery()) // recover from panics, return 500
	r.Use(corsMiddleware())
	r.Use(requestLogger(log))

	// Register all routes
	routes.Setup(
		r,
		tokenMaker,
		rdb,
		authHandler,
		tenantHandler,
		staffHandler,
		storageHandler,
		menuHandler,
		tableHandler,
		orderHandler,
		subHandler,
		waHandler,
		analyticsHandler,
		aiHandler,
	)

	// ── HTTP Server ───────────────────────────────────────────────────────────
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Info("API server starting", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Server failed", zap.Error(err))
		}
	}()

	// ── Graceful Shutdown ─────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutdown signal received, draining connections...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("Server forced to shutdown", zap.Error(err))
	}

	log.Info("DineFlow API stopped cleanly")
}

// ─── Helper Middleware ─────────────────────────────────────────────────────────

// corsMiddleware allows requests from the Next.js frontend during development.
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}

		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// requestLogger logs each HTTP request with method, path, status, and latency.
func requestLogger(log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		log.Info("HTTP request",
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.Int("status", status),
			zap.Duration("latency", latency),
			zap.String("ip", c.ClientIP()),
		)
	}
}
