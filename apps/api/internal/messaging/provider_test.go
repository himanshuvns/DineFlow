package messaging

import (
	"context"
	"testing"
)

func TestCleanPhoneNumber(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"+91 98000-12345", "919800012345"},
		{"9800012345", "919800012345"},
		{"09800012345", "919800012345"},
		{"919800012345", "919800012345"},
		{"+1 (555) 123-4567", "15551234567"},
	}

	for _, tt := range tests {
		got := CleanPhoneNumber(tt.input)
		if got != tt.expected {
			t.Errorf("CleanPhoneNumber(%q) = %q, want %q", tt.input, got, tt.expected)
		}
	}
}

func TestFormatChatID(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"9800012345", "919800012345@c.us"},
		{"+91 98000 12345", "919800012345@c.us"},
		{"919800012345@c.us", "919800012345@c.us"},
	}

	for _, tt := range tests {
		got := FormatChatID(tt.input)
		if got != tt.expected {
			t.Errorf("FormatChatID(%q) = %q, want %q", tt.input, got, tt.expected)
		}
	}
}

func TestMockProvider(t *testing.T) {
	mock := NewMockProvider()
	ctx := context.Background()

	id, err := mock.SendText(ctx, "+91 98000 12345", "Hello World")
	if err != nil {
		t.Fatalf("SendText failed: %v", err)
	}
	if id == "" {
		t.Errorf("Expected non-empty message ID")
	}

	msgs := mock.GetSentMessages()
	if len(msgs) != 1 {
		t.Fatalf("Expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Body != "Hello World" {
		t.Errorf("Expected body 'Hello World', got %q", msgs[0].Body)
	}
	if msgs[0].To != "919800012345" {
		t.Errorf("Expected clean recipient '919800012345', got %q", msgs[0].To)
	}

	// Test session manager
	_ = mock.StartSession(ctx, "test-session")
	status, err := mock.GetSessionStatus(ctx, "test-session")
	if err != nil {
		t.Fatalf("GetSessionStatus failed: %v", err)
	}
	if status.SessionID != "test-session" {
		t.Errorf("Expected session ID 'test-session', got %q", status.SessionID)
	}
}
