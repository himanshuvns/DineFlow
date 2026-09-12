package storage_test

import (
	"context"
	"testing"

	"github.com/dineflow/api/internal/infrastructure/storage"
)

func TestStorageValidation(t *testing.T) {
	svc := storage.NewService(storage.Config{
		Provider:      "mock",
		PublicBaseURL: "https://assets.dineflow.app",
	})

	// Valid image
	err := svc.ValidateUpload("menu-photo.jpg", "image/jpeg", 1024*500)
	if err != nil {
		t.Fatalf("expected valid upload to pass, got: %v", err)
	}

	// Disallowed extension
	err = svc.ValidateUpload("script.sh", "application/x-sh", 1024)
	if err == nil {
		t.Errorf("expected error for .sh extension, got nil")
	}

	// Mismatched mime
	err = svc.ValidateUpload("image.png", "image/jpeg", 1024)
	if err == nil {
		t.Errorf("expected error for mismatched mime type, got nil")
	}

	// File too large (>10MB)
	err = svc.ValidateUpload("big.png", "image/png", 15*1024*1024)
	if err == nil {
		t.Errorf("expected error for file exceeding 10MB limit, got nil")
	}

	// Presign upload
	res, err := svc.PresignUpload(context.Background(), "tenant_123", "logo.png", "image/png", 50000)
	if err != nil {
		t.Fatalf("expected presign to succeed, got: %v", err)
	}
	if res.UploadURL == "" || res.PublicURL == "" || res.Key == "" {
		t.Errorf("expected non-empty fields in PresignedUploadResponse: %+v", res)
	}
}
