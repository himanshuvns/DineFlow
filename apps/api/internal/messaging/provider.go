package messaging

import (
	"context"
	"strings"
	"time"
)

// SessionStatus represents the runtime status of a WhatsApp connection session.
type SessionStatus struct {
	SessionID     string    `json:"sessionId"`
	Status        string    `json:"status"` // "ready", "connected", "qr", "starting", "disconnected", "reconnecting"
	Engine        string    `json:"engine"` // e.g. "whatsapp-web.js", "meta-cloud"
	QRCode        string    `json:"qrCode,omitempty"`
	PhoneNumber   string    `json:"phoneNumber,omitempty"`
	LastConnected time.Time `json:"lastConnected,omitempty"`
	UpdatedAt     time.Time `json:"updatedAt"`
	ErrorMessage  string    `json:"errorMessage,omitempty"`
}

// WhatsAppProvider abstracts WhatsApp message dispatch across different infrastructure gateways
// (OpenWA, Meta Cloud API, Twilio, Mock).
type WhatsAppProvider interface {
	SendText(ctx context.Context, to string, text string) (string, error)
	SendImage(ctx context.Context, to string, imageURL string, caption string) (string, error)
	SendDocument(ctx context.Context, to string, docURL string, filename string, caption string) (string, error)
	Name() string
}

// SessionManager manages WhatsApp session lifecycle (QR codes, authentication, start, stop).
type SessionManager interface {
	StartSession(ctx context.Context, sessionID string) error
	GetQRCode(ctx context.Context, sessionID string) (qr string, status string, err error)
	GetSessionStatus(ctx context.Context, sessionID string) (*SessionStatus, error)
	StopSession(ctx context.Context, sessionID string) error
	RestartSession(ctx context.Context, sessionID string) error
}

// CleanPhoneNumber removes formatting characters (+, -, spaces, parentheses).
// Example: "+91 98000-12345" -> "919800012345"
func CleanPhoneNumber(phone string) string {
	var sb strings.Builder
	for _, ch := range phone {
		if ch >= '0' && ch <= '9' {
			sb.WriteRune(ch)
		}
	}
	digits := sb.String()

	// If 10 digits (standard Indian mobile without country code), prepend 91
	if len(digits) == 10 {
		return "91" + digits
	}
	// If 11 digits starting with 0, replace 0 with 91
	if len(digits) == 11 && strings.HasPrefix(digits, "0") {
		return "91" + digits[1:]
	}

	return digits
}

// FormatChatID converts a clean phone number into OpenWA/WhatsApp Web chatId format.
// Examples:
//   "919800012345" -> "919800012345@c.us"
//   "131361675440249@lid" -> "131361675440249@lid"
func FormatChatID(phone string) string {
	trimmed := strings.TrimSpace(phone)
	if strings.HasSuffix(trimmed, "@c.us") || strings.HasSuffix(trimmed, "@g.us") || strings.HasSuffix(trimmed, "@lid") {
		return trimmed
	}
	cleaned := CleanPhoneNumber(trimmed)
	return cleaned + "@c.us"
}
