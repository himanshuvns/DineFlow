package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// New creates and returns a configured zap.Logger.
// In development: human-readable console output with color.
// In production: structured JSON output for log aggregation.
func New(env string) *zap.Logger {
	var cfg zap.Config

	if env == "production" {
		cfg = zap.NewProductionConfig()
		cfg.EncoderConfig.TimeKey = "timestamp"
		cfg.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	} else {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	logger, err := cfg.Build(zap.AddCallerSkip(0))
	if err != nil {
		// If logger construction fails, fall back to a no-op logger
		// and print to stderr so we at least have some signal.
		_, _ = os.Stderr.WriteString("failed to construct zap logger: " + err.Error() + "\n")
		return zap.NewNop()
	}

	return logger
}
