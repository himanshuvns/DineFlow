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
	cfg            OpenWAConfig
	httpClient     *http.Client
	mu             sync.RWMutex
	lastStatus     *SessionStatus
	sessionUUIDMap map[string]string
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
			Timeout: 45 * time.Second,
		},
		sessionUUIDMap: make(map[string]string),
		lastStatus: &SessionStatus{
			SessionID: sessionID,
			Status:    "disconnected",
			Engine:    "whatsapp-web.js",
			UpdatedAt: time.Now().UTC(),
		},
	}
}

// resolveSessionUUID resolves a human-readable session name into OpenWA's internal UUID.
func (p *OpenWAProvider) resolveSessionUUID(ctx context.Context, sessionIDOrName string) (string, error) {
	if sessionIDOrName == "" {
		sessionIDOrName = p.cfg.SessionID
	}
	// Check if already a UUID
	if len(sessionIDOrName) == 36 && strings.Count(sessionIDOrName, "-") == 4 {
		return sessionIDOrName, nil
	}

	p.mu.RLock()
	cached, ok := p.sessionUUIDMap[sessionIDOrName]
	p.mu.RUnlock()
	if ok && cached != "" {
		return cached, nil
	}

	// 1. Check existing sessions
	listURL := fmt.Sprintf("%s/api/sessions", p.cfg.BaseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, listURL, nil)
	if err == nil {
		if p.cfg.APIKey != "" {
			req.Header.Set("X-API-Key", p.cfg.APIKey)
		}
		if resp, err := p.httpClient.Do(req); err == nil {
			defer resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				var sessions []struct {
					ID   string `json:"id"`
					Name string `json:"name"`
				}
				if json.NewDecoder(resp.Body).Decode(&sessions) == nil {
					for _, s := range sessions {
						if strings.EqualFold(s.Name, sessionIDOrName) || s.ID == sessionIDOrName {
							p.mu.Lock()
							p.sessionUUIDMap[sessionIDOrName] = s.ID
							p.mu.Unlock()
							return s.ID, nil
						}
					}
				}
			}
		}
	}

	// 2. Not found, create new session
	createPayload := map[string]interface{}{
		"name":   sessionIDOrName,
		"engine": "whatsapp-web.js",
	}
	bodyBytes, _ := json.Marshal(createPayload)
	req, err = http.NewRequestWithContext(ctx, http.MethodPost, listURL, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return sessionIDOrName, err
	}
	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return sessionIDOrName, err
	}
	defer resp.Body.Close()

	var created struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&created); err == nil && created.ID != "" {
		p.mu.Lock()
		p.sessionUUIDMap[sessionIDOrName] = created.ID
		p.mu.Unlock()
		return created.ID, nil
	}

	return sessionIDOrName, nil
}

func (p *OpenWAProvider) Name() string {
	return "openwa"
}

// ── Outbound Messaging ───────────────────────────────────────────────────────

// SendText dispatches a plain text WhatsApp message via OpenWA.
func (p *OpenWAProvider) SendText(ctx context.Context, to string, text string) (string, error) {
	sessionUUID, err := p.resolveSessionUUID(ctx, p.cfg.SessionID)
	if err != nil {
		return "", fmt.Errorf("openwa session resolve error: %w", err)
	}

	chatId := FormatChatID(to)
	url := fmt.Sprintf("%s/api/sessions/%s/messages/send-text", p.cfg.BaseURL, sessionUUID)

	payload := map[string]interface{}{
		"chatId": chatId,
		"text":   text,
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
	sessionUUID, err := p.resolveSessionUUID(ctx, p.cfg.SessionID)
	if err != nil {
		return "", fmt.Errorf("openwa session resolve error: %w", err)
	}

	chatId := FormatChatID(to)
	url := fmt.Sprintf("%s/api/sessions/%s/messages/send-image", p.cfg.BaseURL, sessionUUID)

	payload := map[string]interface{}{
		"chatId":  chatId,
		"url":     imageURL,
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
	sessionUUID, err := p.resolveSessionUUID(ctx, p.cfg.SessionID)
	if err != nil {
		return "", fmt.Errorf("openwa session resolve error: %w", err)
	}

	chatId := FormatChatID(to)
	url := fmt.Sprintf("%s/api/sessions/%s/messages/send-document", p.cfg.BaseURL, sessionUUID)

	payload := map[string]interface{}{
		"chatId":   chatId,
		"url":      docURL,
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
	sessionUUID, err := p.resolveSessionUUID(ctx, sessionID)
	if err != nil {
		return fmt.Errorf("openwa resolve session error: %w", err)
	}

	url := fmt.Sprintf("%s/api/sessions/%s/start", p.cfg.BaseURL, sessionUUID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, nil)
	if err != nil {
		return err
	}
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("openwa start session error: %w", err)
	}
	defer resp.Body.Close()

	// Register webhook for this session if not already registered
	p.ensureSessionWebhook(ctx, sessionUUID)

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

func (p *OpenWAProvider) ensureSessionWebhook(ctx context.Context, sessionUUID string) {
	webhookURL := "http://host.docker.internal:8080/api/v1/whatsapp/webhook"
	payload := map[string]interface{}{
		"url":    webhookURL,
		"events": []string{"*"},
		"secret": p.cfg.WebhookSecret,
	}
	bodyBytes, _ := json.Marshal(payload)
	url := fmt.Sprintf("%s/api/sessions/%s/webhooks", p.cfg.BaseURL, sessionUUID)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	if p.cfg.APIKey != "" {
		req.Header.Set("X-API-Key", p.cfg.APIKey)
	}
	resp, err := p.httpClient.Do(req)
	if err == nil {
		defer resp.Body.Close()
	}
}

// GetQRCode fetches the live base64 QR code or ASCII string to link WhatsApp on phone.
func (p *OpenWAProvider) GetQRCode(ctx context.Context, sessionID string) (string, string, error) {
	if sessionID == "" {
		sessionID = p.cfg.SessionID
	}
	sessionUUID, err := p.resolveSessionUUID(ctx, sessionID)
	if err != nil {
		return "", "error", err
	}

	url := fmt.Sprintf("%s/api/sessions/%s/qr", p.cfg.BaseURL, sessionUUID)
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
		QRCode string `json:"qrCode"`
		QR     string `json:"qr"`
		Code   string `json:"code"`
		Status string `json:"status"`
		Data   struct {
			QRCode string `json:"qrCode"`
			QR     string `json:"qr"`
			Code   string `json:"code"`
			Status string `json:"status"`
		} `json:"data"`
	}
	_ = json.Unmarshal(respBytes, &parsed)

	qr := parsed.QRCode
	if qr == "" {
		qr = parsed.QR
	}
	if qr == "" {
		qr = parsed.Code
	}
	if qr == "" {
		qr = parsed.Data.QRCode
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
	if status == "" || status == "qr_ready" {
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
	sessionUUID, err := p.resolveSessionUUID(ctx, sessionID)
	if err != nil {
		return &SessionStatus{
			SessionID:    sessionID,
			Status:       "disconnected",
			Engine:       "whatsapp-web.js",
			UpdatedAt:    time.Now().UTC(),
			ErrorMessage: err.Error(),
		}, nil
	}

	// In OpenWA, session state route is GET /api/sessions/{uuid}
	url := fmt.Sprintf("%s/api/sessions/%s", p.cfg.BaseURL, sessionUUID)
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
		Status      string      `json:"status"`
		Phone       interface{} `json:"phone"`
		PushName    string      `json:"pushName"`
		ConnectedAt string      `json:"connectedAt"`
		LastError   interface{} `json:"lastError"`
		Data        struct {
			Status string      `json:"status"`
			Phone  interface{} `json:"phone"`
		} `json:"data"`
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
	case "starting", "initializing", "authenticating", "created":
		status = "starting"
	case "reconnecting":
		status = "reconnecting"
	default:
		if resp.StatusCode == http.StatusOK && rawStatus != "disconnected" && rawStatus != "stopped" && rawStatus != "" {
			status = rawStatus
		}
	}

	phoneStr := ""
	if parsed.Phone != nil {
		phoneStr = fmt.Sprintf("%v", parsed.Phone)
	} else if parsed.Data.Phone != nil {
		phoneStr = fmt.Sprintf("%v", parsed.Data.Phone)
	}

	res := &SessionStatus{
		SessionID:   sessionID,
		Status:      status,
		Engine:      "whatsapp-web.js",
		PhoneNumber: phoneStr,
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
	sessionUUID, err := p.resolveSessionUUID(ctx, sessionID)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/sessions/%s/stop", p.cfg.BaseURL, sessionUUID)
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
