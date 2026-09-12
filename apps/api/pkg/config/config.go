package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	App      AppConfig
	Server   ServerConfig
	MongoDB  MongoDBConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Email    EmailConfig
	Storage  StorageConfig
	WhatsApp WhatsAppConfig
	AI       AIConfig
}

// AIConfig holds configuration for the AI/LLM integration (Phase 6).
type AIConfig struct {
	GeminiAPIKey string // Optional — empty triggers mock-mode fallback
}

type AppConfig struct {
	Env            string
	SuperAdminKey  string
}

type ServerConfig struct {
	Port            string
	ShutdownTimeout time.Duration
}

type MongoDBConfig struct {
	URI      string
	Database string
}

type RedisConfig struct {
	URL string
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessTTL     time.Duration
	RefreshTTL    time.Duration
}

type EmailConfig struct {
	ResendAPIKey string
	FromAddress  string
	FromName     string
}

type StorageConfig struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	PublicURL       string
	Endpoint        string
}

type WhatsAppConfig struct {
	PhoneNumberID   string
	AccessToken     string
	WebhookVerify   string
	BusinessAccount string
}

// Load reads environment variables and returns a fully populated Config.
// It loads .env if present (dev mode). Required vars cause a fatal error if missing.
func Load() (*Config, error) {
	// Load .env file if it exists (silently ignore if not found in production)
	_ = godotenv.Load()

	cfg := &Config{}

	// ── App ──────────────────────────────────────────────────────────────────
	cfg.App.Env = getEnv("APP_ENV", "development")
	cfg.App.SuperAdminKey = requireEnv("SUPER_ADMIN_SECRET")

	// ── Server ───────────────────────────────────────────────────────────────
	cfg.Server.Port = getEnv("PORT", "8080")
	cfg.Server.ShutdownTimeout = 10 * time.Second

	// ── MongoDB ───────────────────────────────────────────────────────────────
	cfg.MongoDB.URI = requireEnv("MONGODB_URI")
	cfg.MongoDB.Database = getEnv("MONGODB_DATABASE", "dineflow")

	// ── Redis ─────────────────────────────────────────────────────────────────
	cfg.Redis.URL = requireEnv("REDIS_URL")

	// ── JWT ───────────────────────────────────────────────────────────────────
	cfg.JWT.AccessSecret = requireEnv("JWT_ACCESS_SECRET")
	cfg.JWT.RefreshSecret = requireEnv("JWT_REFRESH_SECRET")
	accessTTL := getEnvInt("JWT_ACCESS_TTL_MINUTES", 15)
	refreshTTL := getEnvInt("JWT_REFRESH_TTL_DAYS", 7)
	cfg.JWT.AccessTTL = time.Duration(accessTTL) * time.Minute
	cfg.JWT.RefreshTTL = time.Duration(refreshTTL) * 24 * time.Hour

	// ── Email ─────────────────────────────────────────────────────────────────
	cfg.Email.ResendAPIKey = getEnv("RESEND_API_KEY", "")
	cfg.Email.FromAddress = getEnv("EMAIL_FROM", "noreply@dineflow.app")
	cfg.Email.FromName = getEnv("EMAIL_FROM_NAME", "DineFlow")

	// ── Storage (Cloudflare R2 / S3-compatible) ───────────────────────────────
	cfg.Storage.AccountID = getEnv("R2_ACCOUNT_ID", "")
	cfg.Storage.AccessKeyID = getEnv("R2_ACCESS_KEY_ID", "")
	cfg.Storage.SecretAccessKey = getEnv("R2_SECRET_ACCESS_KEY", "")
	cfg.Storage.BucketName = getEnv("R2_BUCKET_NAME", "dineflow-assets")
	cfg.Storage.PublicURL = getEnv("R2_PUBLIC_URL", "")
	cfg.Storage.Endpoint = fmt.Sprintf(
		"https://%s.r2.cloudflarestorage.com",
		cfg.Storage.AccountID,
	)

	// ── WhatsApp ──────────────────────────────────────────────────────────────
	cfg.WhatsApp.PhoneNumberID = getEnv("WHATSAPP_PHONE_NUMBER_ID", "")
	cfg.WhatsApp.AccessToken = getEnv("WHATSAPP_ACCESS_TOKEN", "")
	cfg.WhatsApp.WebhookVerify = getEnv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "")
	cfg.WhatsApp.BusinessAccount = getEnv("WHATSAPP_BUSINESS_ACCOUNT_ID", "")

	// ── AI / Gemini (Phase 6) ─────────────────────────────────────────────────
	cfg.AI.GeminiAPIKey = getEnv("GEMINI_API_KEY", "") // Optional: empty = mock mode

	return cfg, nil
}

// IsDevelopment returns true when running in development mode.
func (c *Config) IsDevelopment() bool {
	return c.App.Env == "development"
}

// IsProduction returns true when running in production mode.
func (c *Config) IsProduction() bool {
	return c.App.Env == "production"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}

func requireEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		panic(fmt.Sprintf("required environment variable %q is not set", key))
	}
	return val
}

func getEnvInt(key string, fallback int) int {
	if val, ok := os.LookupEnv(key); ok {
		if i, err := strconv.Atoi(val); err == nil {
			return i
		}
	}
	return fallback
}
