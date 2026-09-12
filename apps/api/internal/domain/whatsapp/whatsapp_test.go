package whatsapp

import (
	"strings"
	"testing"
)

func TestBuildOrderConfirmationMessage(t *testing.T) {
	data := OrderConfirmationData{
		CustomerName:   "Aarav",
		RestaurantName: "The Grand Bistro",
		LocationName:   "Suite 302",
		OrderNumber:    "ORD-9841",
		TotalAmount:    1450.00,
		Currency:       "INR",
		ItemCount:      3,
		TrackingURL:    "https://dineflow.app/m/the-grand-bistro/order/ORD-9841",
	}

	msg := BuildOrderConfirmationMessage(data)

	if !strings.Contains(msg, "Aarav") {
		t.Errorf("expected customer name in message, got %s", msg)
	}
	if !strings.Contains(msg, "Suite 302") {
		t.Errorf("expected location in message, got %s", msg)
	}
	if !strings.Contains(msg, "₹1450.00") {
		t.Errorf("expected price in message, got %s", msg)
	}
	if !strings.Contains(msg, "Reply STOP to unsubscribe") {
		t.Errorf("expected opt-out disclosure in message")
	}
}

func TestIsOptOutKeyword(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"STOP", true},
		{"stop", true},
		{" Stop ", true},
		{"UNSUBSCRIBE", true},
		{"cancel", true},
		{"Hello there", false},
		{"More water please", false},
	}

	for _, tt := range tests {
		got := IsOptOutKeyword(tt.input)
		if got != tt.expected {
			t.Errorf("IsOptOutKeyword(%q) = %v, want %v", tt.input, got, tt.expected)
		}
	}
}

func TestParseRating(t *testing.T) {
	tests := []struct {
		input      string
		wantRating int
		wantValid  bool
	}{
		{"5", 5, true},
		{"1", 1, true},
		{"3", 3, true},
		{"0", 0, false},
		{"6", 0, false},
		{"⭐⭐⭐⭐⭐", 5, true},
		{"★★★", 3, true},
		{"awesome!", 0, false},
	}

	for _, tt := range tests {
		rating, valid := ParseRating(tt.input)
		if rating != tt.wantRating || valid != tt.wantValid {
			t.Errorf("ParseRating(%q) = (%d, %v), want (%d, %v)", tt.input, rating, valid, tt.wantRating, tt.wantValid)
		}
	}
}
