package messaging

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// SentMessage stores an in-memory record of a dispatched message.
type SentMessage struct {
	To        string
	Type      string // "text", "image", "document"
	Body      string
	MediaURL  string
	Filename  string
	Caption   string
	Timestamp time.Time
}

// MockProvider implements both WhatsAppProvider and SessionManager in memory.
type MockProvider struct {
	mu           sync.RWMutex
	messages     []SentMessage
	sessionState string
	sessionID    string
}

// NewMockProvider creates an in-memory mock WhatsApp provider.
func NewMockProvider() *MockProvider {
	return &MockProvider{
		sessionState: "connected",
		sessionID:    "dineflow-mock",
		messages:     make([]SentMessage, 0),
	}
}

func (m *MockProvider) Name() string {
	return "mock"
}

func (m *MockProvider) SendText(ctx context.Context, to string, text string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	msg := SentMessage{
		To:        CleanPhoneNumber(to),
		Type:      "text",
		Body:      text,
		Timestamp: time.Now().UTC(),
	}
	m.messages = append(m.messages, msg)

	return fmt.Sprintf("mock_msg_%d", time.Now().UnixNano()), nil
}

func (m *MockProvider) SendImage(ctx context.Context, to string, imageURL string, caption string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	msg := SentMessage{
		To:        CleanPhoneNumber(to),
		Type:      "image",
		MediaURL:  imageURL,
		Caption:   caption,
		Timestamp: time.Now().UTC(),
	}
	m.messages = append(m.messages, msg)

	return fmt.Sprintf("mock_img_%d", time.Now().UnixNano()), nil
}

func (m *MockProvider) SendDocument(ctx context.Context, to string, docURL string, filename string, caption string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	msg := SentMessage{
		To:        CleanPhoneNumber(to),
		Type:      "document",
		MediaURL:  docURL,
		Filename:  filename,
		Caption:   caption,
		Timestamp: time.Now().UTC(),
	}
	m.messages = append(m.messages, msg)

	return fmt.Sprintf("mock_doc_%d", time.Now().UnixNano()), nil
}

func (m *MockProvider) StartSession(ctx context.Context, sessionID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessionID = sessionID
	m.sessionState = "starting"
	return nil
}

func (m *MockProvider) GetQRCode(ctx context.Context, sessionID string) (string, string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return "2@mock_qr_token_for_dineflow_local_development_testing_only==", "qr", nil
}

func (m *MockProvider) GetSessionStatus(ctx context.Context, sessionID string) (*SessionStatus, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return &SessionStatus{
		SessionID:     sessionID,
		Status:        m.sessionState,
		Engine:        "mock-engine",
		PhoneNumber:   "919800012345",
		LastConnected: time.Now().UTC(),
		UpdatedAt:     time.Now().UTC(),
	}, nil
}

func (m *MockProvider) StopSession(ctx context.Context, sessionID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessionState = "disconnected"
	return nil
}

func (m *MockProvider) RestartSession(ctx context.Context, sessionID string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.sessionState = "connected"
	return nil
}

// GetSentMessages returns all recorded messages (useful for unit testing).
func (m *MockProvider) GetSentMessages() []SentMessage {
	m.mu.RLock()
	defer m.mu.RUnlock()
	res := make([]SentMessage, len(m.messages))
	copy(res, m.messages)
	return res
}

// Reset clears the sent messages list.
func (m *MockProvider) Reset() {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.messages = make([]SentMessage, 0)
}
