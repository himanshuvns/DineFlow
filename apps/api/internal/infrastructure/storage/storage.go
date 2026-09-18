package storage

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"path/filepath"
	"strings"
	"time"
)

// AllowedFileTypes maps permitted extensions to their allowed MIME types.
var AllowedFileTypes = map[string][]string{
	".jpg":  {"image/jpeg"},
	".jpeg": {"image/jpeg"},
	".png":  {"image/png"},
	".webp": {"image/webp"},
	".svg":  {"image/svg+xml"},
	".pdf":  {"application/pdf"},
}

// MaxFileSize bytes (10MB for menu assets/logos).
const MaxFileSizeBytes = 10 * 1024 * 1024

// PresignedUploadResponse holds upload instructions for the client.
type PresignedUploadResponse struct {
	UploadURL string            `json:"uploadUrl"`
	PublicURL string            `json:"publicUrl"`
	Key       string            `json:"key"`
	ExpiresAt time.Time         `json:"expiresAt"`
	Headers   map[string]string `json:"headers,omitempty"`
}

// StorageService defines operations for cloud object storage (R2 / S3).
type StorageService interface {
	PresignUpload(ctx context.Context, tenantID, fileName, contentType string, size int64) (*PresignedUploadResponse, error)
	GetPublicURL(key string) string
	ValidateUpload(fileName, contentType string, size int64) error
}

// Config holds storage provider configuration.
type Config struct {
	Provider        string // "s3", "r2", "mock"
	Bucket          string
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	PublicBaseURL   string
}

// Service implements StorageService.
type Service struct {
	cfg Config
}

// NewService instantiates a new StorageService.
func NewService(cfg Config) *Service {
	if cfg.PublicBaseURL == "" {
		cfg.PublicBaseURL = "https://assets.dineflow.app"
	}
	return &Service{cfg: cfg}
}

// ValidateUpload checks file type and size restrictions.
func (s *Service) ValidateUpload(fileName, contentType string, size int64) error {
	if size <= 0 {
		return errors.New("file size must be greater than 0")
	}
	if size > MaxFileSizeBytes {
		return fmt.Errorf("file size exceeds maximum permitted limit of %d MB", MaxFileSizeBytes/(1024*1024))
	}

	ext := strings.ToLower(filepath.Ext(fileName))
	mimes, ok := AllowedFileTypes[ext]
	if !ok {
		return fmt.Errorf("file extension '%s' is not supported", ext)
	}

	validMime := false
	for _, m := range mimes {
		if strings.EqualFold(m, contentType) {
			validMime = true
			break
		}
	}
	if !validMime {
		return fmt.Errorf("content-type '%s' does not match extension '%s'", contentType, ext)
	}

	return nil
}

// PresignUpload generates a presigned URL or direct upload target.
func (s *Service) PresignUpload(ctx context.Context, tenantID, fileName, contentType string, size int64) (*PresignedUploadResponse, error) {
	if err := s.ValidateUpload(fileName, contentType, size); err != nil {
		return nil, err
	}

	// Generate safe key: tenants/{tenantID}/{timestamp}_{hash(filename)}.{ext}
	ext := strings.ToLower(filepath.Ext(fileName))
	h := sha256.Sum256([]byte(fmt.Sprintf("%s:%d", fileName, time.Now().UnixNano())))
	hashStr := hex.EncodeToString(h[:8])
	key := fmt.Sprintf("tenants/%s/%d_%s%s", tenantID, time.Now().Unix(), hashStr, ext)

	expiresAt := time.Now().Add(15 * time.Minute)
	publicURL := fmt.Sprintf("%s/%s", strings.TrimRight(s.cfg.PublicBaseURL, "/"), key)

	var uploadURL string
	if s.cfg.Endpoint != "" {
		uploadURL = fmt.Sprintf("%s/%s/%s?upload_id=%s", strings.TrimRight(s.cfg.Endpoint, "/"), s.cfg.Bucket, key, hashStr)
	} else {
		uploadURL = fmt.Sprintf("%s/api/v1/storage/upload/%s", strings.TrimRight(s.cfg.PublicBaseURL, "/"), key)
	}

	headers := map[string]string{
		"Content-Type":           contentType,
		"X-Content-Type-Options": "nosniff",
	}
	if ext == ".svg" {
		headers["Content-Security-Policy"] = "default-src 'none'; sandbox"
		headers["Content-Disposition"] = "attachment"
	}

	return &PresignedUploadResponse{
		UploadURL: uploadURL,
		PublicURL: publicURL,
		Key:       key,
		ExpiresAt: expiresAt,
		Headers:   headers,
	}, nil
}

// GetPublicURL returns the public CDN URL for a key.
func (s *Service) GetPublicURL(key string) string {
	return fmt.Sprintf("%s/%s", strings.TrimRight(s.cfg.PublicBaseURL, "/"), key)
}
