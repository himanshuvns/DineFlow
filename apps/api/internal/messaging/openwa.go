package messaging

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

// OpenWAConfig contains credentials and endpoint for the local OpenWA Docker service.
type OpenWAConfig struct {
	BaseURL       string
	APIKey        string
	SessionID     string
	WebhookSecret string
}

// OpenWAProvider implements both WhatsAppProvider and SessionManager for the OpenWA container.
type OpenWAProvider struct {
	cfg        OpenWAConfig
	httpClient *http.Client
	mu         sync.RWMutex
	lastStatus *SessionStatus
}

// NewOpenWAProvider creates a new OpenWA provider instance.
func NewOpenWAProvider(cfg OpenWAConfig) *OpenWAProvider {
	baseURL := strings.TrimRight(cfg.BaseURL, "/")
	if baseURL == "" {
		baseURL = "http://localhost:2785"
	}
	sessionID := cfg.SessionID
	if sessionID == "" {
		sessionID = "dineflow-dev"
	}

	return &OpenWAProvider{
		cfg: OpenWAConfig{
			BaseURL:       baseURL,
			APIKey:        cfg.APIKey,
			SessionID:     sessionID,
			WebhookSecret: cfg.WebhookSecret,
		},
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
		lastStatus: &SessionStatus{
			SessionID: sessionID,
			Status:    "disconnected",
			Engine:    "whatsapp-web.js",
			UpdatedAt: time.Now().UTC(),
		},
	}
}

func (p *OpenWAProvider) Name() string {
	return "openwa"
}

// ── Outbound Messaging ───────────────────────────────────────────────────────

// SendText dispatches a plain text WhatsApp message via OpenWA.
func (p *OpenWAProvider) SendText(ctx context.Context, to string, text string) (string, error) {
	chatId := FormatChatID(to)
	url := fmt.Sprintf("%s/api/sessions/%s/messages/send-text", p.cfg.BaseURL, p.cfg.SessionID)

	payload := map[string]interface{}{
		"chatId":  chatId,
		"text":    text,
		"message": text, // backward compat with varied OpenWA builds
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("openwa marshal error: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", fmt.Errorf("openwa request error: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
		req.Header.Set("Authorization", "Bearer "+p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("openwa connection failed (ensure docker-compose.openwa.yml is running on :2785): %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("openwa send text rejected (status %d): %s", resp.StatusCode, string(respBody))
	}

	var parsed struct {
		ID   string `json:"id"`
		Data struct {
			ID string `json:"id"`
		} `json:"data"`
	}
	_ = json.Unmarshal(respBody, &parsed)

	msgID := parsed.ID
	if msgID == "" {
		msgID = parsed.Data.ID
	}
	if msgID == "" {
		msgID = fmt.Sprintf("openwa_%d_%s", time.Now().UnixNano(), CleanPhoneNumber(to))
	}

	return msgID, nil
}

// SendImage sends an image with optional caption via OpenWA.
func (p *OpenWAProvider) SendImage(ctx context.Context, to string, imageURL string, caption string) (string, error) {
	chatId := FormatChatID(to)
	url := fmt.Sprintf("%s/api/sessions/%s/messages/send-image", p.cfg.BaseURL, p.cfg.SessionID)

	payload := map[string]interface{}{
		"chatId":  chatId,
		"file":    imageURL,
		"caption": caption,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("openwa send image rejected (status %d): %s", resp.StatusCode, string(respBody))
	}

	return fmt.Sprintf("openwa_img_%d", time.Now().UnixNano()), nil
}

// SendDocument sends a PDF or invoice document via OpenWA.
func (p *OpenWAProvider) SendDocument(ctx context.Context, to string, docURL string, filename string, caption string) (string, error) {
	chatId := FormatChatID(to)
	url := fmt.Sprintf("%s/api/sessions/%s/messages/send-file", p.cfg.BaseURL, p.cfg.SessionID)

	payload := map[string]interface{}{
		"chatId":   chatId,
		"file":     docURL,
		"filename": filename,
		"caption":  caption,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("openwa send document rejected (status %d): %s", resp.StatusCode, string(respBody))
	}

	return fmt.Sprintf("openwa_doc_%d", time.Now().UnixNano()), nil
}

// ── Session & QR Code Management ─────────────────────────────────────────────

// StartSession requests OpenWA to initialize or spawn the Chromium browser engine for the session.
func (p *OpenWAProvider) StartSession(ctx context.Context, sessionID string) error {
	if sessionID == "" {
		sessionID = p.cfg.SessionID
	}

	url := fmt.Sprintf("%s/api/sessions/%s/start", p.cfg.BaseURL, sessionID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return err
	}
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		// If direct start fails because session does not exist yet, attempt creation
		return p.createSession(ctx, sessionID)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return p.createSession(ctx, sessionID)
	}

	p.mu.Lock()
	p.lastStatus = &SessionStatus{
		SessionID: sessionID,
		Status:    "starting",
		Engine:    "whatsapp-web.js",
		UpdatedAt: time.Now().UTC(),
	}
	p.mu.Unlock()

	return nil
}

func (p *OpenWAProvider) createSession(ctx context.Context, sessionID string) error {
	url := fmt.Sprintf("%s/api/sessions", p.cfg.BaseURL)
	payload := map[string]interface{}{
		"name":   sessionID,
		"engine": "whatsapp-web.js",
	}
	bodyBytes, _ := json.Marshal(payload)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("openwa session create error: %w", err)
	}
	defer resp.Body.Close()

	return nil
}

// GetQRCode fetches the live base64 QR code or ASCII string to link WhatsApp on phone.
func (p *OpenWAProvider) GetQRCode(ctx context.Context, sessionID string) (string, string, error) {
	if sessionID == "" {
		sessionID = p.cfg.SessionID
	}

	url := fmt.Sprintf("%s/api/sessions/%s/qr", p.cfg.BaseURL, sessionID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", "error", err
	}
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", "disconnected", fmt.Errorf("openwa gateway unreachable on %s: %w", p.cfg.BaseURL, err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "error", err
	}

	if resp.StatusCode == http.StatusNotFound {
		return "", "disconnected", nil
	}

	var parsed struct {
		QR     string `json:"qr"`
		Code   string `json:"code"`
		Status string `json:"status"`
		Data   struct {
			QR     string `json:"qr"`
			Code   string `json:"code"`
			Status string `json:"status"`
		} `json:"data"`
	}
	_ = json.Unmarshal(respBytes, &parsed)

	qr := parsed.QR
	if qr == "" {
		qr = parsed.Code
	}
	if qr == "" {
		qr = parsed.Data.QR
	}
	if qr == "" {
		qr = parsed.Data.Code
	}

	status := parsed.Status
	if status == "" {
		status = parsed.Data.Status
	}
	if status == "" {
		if qr != "" {
			status = "qr"
		} else {
			status = "starting"
		}
	}

	return qr, status, nil
}

// GetSessionStatus retrieves the current connection state of the session.
func (p *OpenWAProvider) GetSessionStatus(ctx context.Context, sessionID string) (*SessionStatus, error) {
	if sessionID == "" {
		sessionID = p.cfg.SessionID
	}

	url := fmt.Sprintf("%s/api/sessions/%s/status", p.cfg.BaseURL, sessionID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return &SessionStatus{
			SessionID:    sessionID,
			Status:       "disconnected",
			Engine:       "whatsapp-web.js",
			UpdatedAt:    time.Now().UTC(),
			ErrorMessage: "OpenWA container is offline. Run 'docker compose -f docker-compose.openwa.yml up -d'",
		}, nil
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)

	var parsed struct {
		Status string `json:"status"`
		Data   struct {
			Status string `json:"status"`
			Phone  string `json:"phone"`
		} `json:"data"`
		Phone string `json:"phone"`
	}
	_ = json.Unmarshal(respBytes, &parsed)

	rawStatus := strings.ToLower(parsed.Status)
	if rawStatus == "" {
		rawStatus = strings.ToLower(parsed.Data.Status)
	}

	status := "disconnected"
	switch rawStatus {
	case "ready", "connected", "authenticated":
		status = "connected"
	case "qr", "qr_ready", "scan_qr":
		status = "qr"
	case "starting", "initializing", "authenticating":
		status = "starting"
	case "reconnecting":
		status = "reconnecting"
	default:
		if resp.StatusCode == http.StatusOK {
			status = "connected"
		}
	}

	phone := parsed.Phone
	if phone == "" {
		phone = parsed.Data.Phone
	}

	res := &SessionStatus{
		SessionID:   sessionID,
		Status:      status,
		Engine:      "whatsapp-web.js",
		PhoneNumber: phone,
		UpdatedAt:   time.Now().UTC(),
	}
	if status == "connected" {
		res.LastConnected = time.Now().UTC()
	}

	p.mu.Lock()
	p.lastStatus = res
	p.mu.Unlock()

	return res, nil
}

// StopSession requests OpenWA to disconnect and tear down Chromium for this session.
func (p *OpenWAProvider) StopSession(ctx context.Context, sessionID string) error {
	if sessionID == "" {
		sessionID = p.cfg.SessionID
	}

	url := fmt.Sprintf("%s/api/sessions/%s/stop", p.cfg.BaseURL, sessionID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return err
	}
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	p.mu.Lock()
	p.lastStatus = &SessionStatus{
		SessionID: sessionID,
		Status:    "disconnected",
		Engine:    "whatsapp-web.js",
		UpdatedAt: time.Now().UTC(),
	}
	p.mu.Unlock()

	return nil
}

// RestartSession terminates and relaunches the WhatsApp session.
func (p *OpenWAProvider) RestartSession(ctx context.Context, sessionID string) error {
	_ = p.StopSession(ctx, sessionID)
	time.Sleep(500 * time.Millisecond)
	return p.StartSession(ctx, sessionID)
}

// UpdateFromWebhook updates the cached session state from an incoming webhook event.
func (p *OpenWAProvider) UpdateFromWebhook(status string) {
	p.mu.Lock()
	defer p.mu.Unlock()
	if p.lastStatus == nil {
		p.lastStatus = &SessionStatus{
			SessionID: p.cfg.SessionID,
			Engine:    "whatsapp-web.js",
		}
	}
	p.lastStatus.Status = status
	p.lastStatus.UpdatedAt = time.Now().UTC()
	if status == "connected" || status == "ready" {
		p.lastStatus.LastConnected = time.Now().UTC()
	}
}
