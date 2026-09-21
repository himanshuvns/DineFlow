package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"strings"

	aiapp "github.com/dineflow/api/internal/application/ai"
	analyticsapp "github.com/dineflow/api/internal/application/analytics"
	authapp "github.com/dineflow/api/internal/application/auth"
	menuapp "github.com/dineflow/api/internal/application/menu"
	notifapp "github.com/dineflow/api/internal/application/notification"
	orderapp "github.com/dineflow/api/internal/application/order"
	platformapp "github.com/dineflow/api/internal/application/platform"
	roomapp "github.com/dineflow/api/internal/application/room"
	searchapp "github.com/dineflow/api/internal/application/search"
	staffapp "github.com/dineflow/api/internal/application/staff"
	subapp "github.com/dineflow/api/internal/application/subscription"
	tableapp "github.com/dineflow/api/internal/application/table"
	whatsappapp "github.com/dineflow/api/internal/application/whatsapp"
	emailinfra "github.com/dineflow/api/internal/infrastructure/email"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	realtimeinfra "github.com/dineflow/api/internal/infrastructure/realtime"
	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	storageinfra "github.com/dineflow/api/internal/infrastructure/storage"
	"github.com/dineflow/api/internal/interfaces/http/handlers"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/internal/interfaces/http/routes"
	"github.com/dineflow/api/internal/messaging"
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

	// ── Connect MongoDB (with retry) ──────────────────────────────────────────
	var mongoDB *mongoinfra.Client
	for attempt := 1; attempt <= 15; attempt++ {
		mongoDB, err = mongoinfra.New(ctx, cfg.MongoDB.URI, cfg.MongoDB.Database, log)
		if err == nil {
			break
		}
		log.Warn("MongoDB not ready, retrying...", zap.Int("attempt", attempt), zap.Error(err))
		select {
		case <-ctx.Done():
			log.Fatal("Context cancelled while waiting for MongoDB")
		case <-time.After(2 * time.Second):
		}
	}
	if err != nil {
		log.Fatal("Failed to connect to MongoDB after retries", zap.Error(err))
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

	// ── Connect Redis (with retry) ────────────────────────────────────────────
	var rdb *redisinfra.Client
	for attempt := 1; attempt <= 15; attempt++ {
		rdb, err = redisinfra.New(ctx, cfg.Redis.URL, log)
		if err == nil {
			break
		}
		log.Warn("Redis not ready, retrying...", zap.Int("attempt", attempt), zap.Error(err))
		select {
		case <-ctx.Done():
			log.Fatal("Context cancelled while waiting for Redis")
		case <-time.After(2 * time.Second):
		}
	}
	if err != nil {
		log.Fatal("Failed to connect to Redis after retries", zap.Error(err))
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
	roomService := roomapp.NewService(mongoDB)
	orderService := orderapp.NewService(mongoDB, hub)
	staffService := staffapp.NewService(mongoDB)
	subService := subapp.NewService(mongoDB)
	waService := whatsappapp.NewService(mongoDB)
	analyticsService := analyticsapp.NewService(mongoDB)
	aiService := aiapp.NewService(cfg.AI.GeminiAPIKey, mongoDB)
	notifService := notifapp.NewService(mongoDB, hub)
	searchService := searchapp.NewService(mongoDB)
	platformService := platformapp.NewService(mongoDB, rdb)

	authHandler := handlers.NewAuthHandler(authService)
	tenantHandler := handlers.NewTenantHandler(mongoDB)
	staffHandler := handlers.NewStaffHandler(staffService)
	storageHandler := handlers.NewStorageHandler(storageService)
	menuHandler := handlers.NewMenuHandler(menuService, aiService)
	tableHandler := handlers.NewTableHandler(tableService)
	roomHandler := handlers.NewRoomHandler(roomService, notifService)
	orderHandler := handlers.NewOrderHandler(orderService, hub)
	subHandler := handlers.NewSubscriptionHandler(subService)
	waHandler := handlers.NewWhatsAppHandler(waService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	aiHandler := handlers.NewAIHandler(aiService)
	notifHandler := handlers.NewNotificationHandler(notifService, hub)
	searchHandler := handlers.NewSearchHandler(searchService)
	platformHandler := handlers.NewPlatformHandler(platformService)

	// ── WhatsApp Gateway Provider (OpenWA / Meta Cloud API / Mock) ───────────
	var waProvider messaging.WhatsAppProvider
	switch strings.ToLower(cfg.WhatsApp.Provider) {
	case "openwa":
		waProvider = messaging.NewOpenWAProvider(messaging.OpenWAConfig{
			BaseURL:       cfg.WhatsApp.OpenWA.URL,
			APIKey:        cfg.WhatsApp.OpenWA.APIKey,
			SessionID:     cfg.WhatsApp.OpenWA.SessionID,
			WebhookSecret: cfg.WhatsApp.OpenWA.WebhookSecret,
		})
		log.Info("Initialized OpenWA WhatsApp Provider (Local Dev Gateway)",
			zap.String("url", cfg.WhatsApp.OpenWA.URL),
			zap.String("session", cfg.WhatsApp.OpenWA.SessionID),
		)
	case "meta":
		waProvider = messaging.NewMetaCloudProvider(messaging.MetaCloudConfig{
			PhoneNumberID:   cfg.WhatsApp.PhoneNumberID,
			AccessToken:     cfg.WhatsApp.AccessToken,
			BusinessAccount: cfg.WhatsApp.BusinessAccount,
		})
		log.Info("Initialized Meta Cloud WhatsApp Provider")
	default:
		waProvider = messaging.NewMockProvider()
		log.Info("Initialized Mock WhatsApp Provider (Offline Sandbox)")
	}

	waService.SetProvider(waProvider)
	waService.SetAdminAlertConfig(cfg.WhatsApp.AdminNumbers, cfg.WhatsApp.LargeOrderThreshold)

	// Inject notifService into order, whatsapp & staff services for real-time event emission
	orderService.SetNotificationService(notifService)
	orderService.SetWhatsAppNotifier(waService)
	waService.SetNotificationService(notifService)
	waService.SetStaffService(staffService)
	staffService.SetNotificationService(notifService)
	roomHandler.SetStaffService(staffService)
	roomHandler.SetWhatsAppService(waService)

	// Inject ping functions for health endpoint
	handlers.SetHealthDeps(
		func() error { return mongoDB.Ping(ctx) },
		func() error { return rdb.Ping(ctx) },
	)

	// ── Build Router ──────────────────────────────────────────────────────────
	r := gin.New()

	// Global middleware
	r.Use(gin.Recovery()) // recover from panics, return 500
	r.Use(middleware.RequestID())
	r.Use(middleware.SecurityHeaders())
	r.Use(corsMiddleware())
	r.Use(middleware.IPBlocklist(rdb))
	r.Use(middleware.NoSQLSanitizer())
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
		roomHandler,
		notifHandler,
		searchHandler,
		platformHandler,
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

// corsMiddleware enforces strict origin validation and prevents wildcard reflection with credentials.
func corsMiddleware() gin.HandlerFunc {
	allowedOrigins := map[string]bool{
		"https://dineflow-steel.vercel.app": true,
		"http://localhost:3000":             true,
		"http://localhost:3001":             true,
		"http://127.0.0.1:3000":             true,
		"http://127.0.0.1:3001":             true,
	}

	if envOrigins := os.Getenv("ALLOWED_ORIGINS"); envOrigins != "" {
		for _, o := range strings.Split(envOrigins, ",") {
			o = strings.TrimSpace(o)
			if o != "" {
				allowedOrigins[o] = true
			}
		}
	}

	isAllowedOrigin := func(origin string) bool {
		if allowedOrigins[origin] {
			return true
		}
		// Allow Vercel preview environments
		if strings.HasPrefix(origin, "https://") && strings.HasSuffix(origin, ".vercel.app") {
			return true
		}
		return false
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		if origin != "" && isAllowedOrigin(origin) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key, X-Request-ID, X-Hub-Signature-256")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			c.Header("Access-Control-Max-Age", "86400")
		} else if origin == "" {
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Idempotency-Key, X-Request-ID")
		}

		if c.Request.Method == "OPTIONS" {
			if origin != "" && isAllowedOrigin(origin) {
				c.AbortWithStatus(204)
			} else if origin == "" {
				c.AbortWithStatus(204)
			} else {
				c.AbortWithStatus(http.StatusForbidden)
			}
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
