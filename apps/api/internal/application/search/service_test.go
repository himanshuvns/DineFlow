package search

import (
	"context"
	"testing"

	"go.mongodb.org/mongo-driver/v2/bson"
)

func TestSearchAll_ShortQuery(t *testing.T) {
	svc := NewService(nil)
	resp, err := svc.SearchAll(context.Background(), bson.NewObjectID(), "a")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Total != 0 {
		t.Errorf("expected 0 results for short query, got %d", resp.Total)
	}
	if resp.Query != "a" {
		t.Errorf("expected query 'a', got '%s'", resp.Query)
	}
}

func TestSearchAll_EmptyQuery(t *testing.T) {
	svc := NewService(nil)
	resp, err := svc.SearchAll(context.Background(), bson.NewObjectID(), "   ")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if resp.Total != 0 {
		t.Errorf("expected 0 results for empty query, got %d", resp.Total)
	}
}
