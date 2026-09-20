package messaging

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// MetaCloudConfig contains credentials for Meta's Official WhatsApp Cloud API.
type MetaCloudConfig struct {
	PhoneNumberID   string
	AccessToken     string
	BusinessAccount string
}

// MetaCloudProvider implements WhatsAppProvider using Meta's Official Cloud API (Graph API v21.0).
type MetaCloudProvider struct {
	cfg        MetaCloudConfig
	httpClient *http.Client
}

// NewMetaCloudProvider initializes a Meta Cloud API provider.
func NewMetaCloudProvider(cfg MetaCloudConfig) *MetaCloudProvider {
	return &MetaCloudProvider{
		cfg:        cfg,
		httpClient: &http.Client{Timeout: 15 * time.Second},
	}
}

func (p *MetaCloudProvider) Name() string {
	return "meta"
}

func (p *MetaCloudProvider) SendText(ctx context.Context, to string, text string) (string, error) {
	cleanPhone := CleanPhoneNumber(to)
	if p.cfg.PhoneNumberID == "" || p.cfg.AccessToken == "" || strings.Contains(p.cfg.PhoneNumberID, "mock") {
		// Mock fallback if credentials are unset
		return fmt.Sprintf("wamid.mock_%d_%s", time.Now().UnixNano(), cleanPhone), nil
	}

	url := fmt.Sprintf("https://graph.facebook.com/v21.0/%s/messages", p.cfg.PhoneNumberID)
	payload := map[string]interface{}{
		"messaging_product": "whatsapp",
		"recipient_type":    "individual",
		"to":                cleanPhone,
		"type":              "text",
		"text": map[string]string{
			"body": text,
		},
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+p.cfg.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("meta cloud api request error: %w", err)
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("meta cloud api error (%d): %s", resp.StatusCode, string(respBytes))
	}

	var metaResp struct {
		Messages []struct {
			ID string `json:"id"`
		} `json:"messages"`
	}
	_ = json.Unmarshal(respBytes, &metaResp)

	if len(metaResp.Messages) > 0 {
		return metaResp.Messages[0].ID, nil
	}

	return fmt.Sprintf("wamid.meta_%d", time.Now().UnixNano()), nil
}

func (p *MetaCloudProvider) SendImage(ctx context.Context, to string, imageURL string, caption string) (string, error) {
	cleanPhone := CleanPhoneNumber(to)
	if p.cfg.PhoneNumberID == "" || p.cfg.AccessToken == "" {
		return fmt.Sprintf("wamid.mock_img_%d", time.Now().UnixNano()), nil
	}

	url := fmt.Sprintf("https://graph.facebook.com/v21.0/%s/messages", p.cfg.PhoneNumberID)
	payload := map[string]interface{}{
		"messaging_product": "whatsapp",
		"recipient_type":    "individual",
		"to":                cleanPhone,
		"type":              "image",
		"image": map[string]string{
			"link":    imageURL,
			"caption": caption,
		},
	}

	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	req.Header.Set("Authorization", "Bearer "+p.cfg.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	return fmt.Sprintf("wamid.meta_img_%d", time.Now().UnixNano()), nil
}

func (p *MetaCloudProvider) SendDocument(ctx context.Context, to string, docURL string, filename string, caption string) (string, error) {
	cleanPhone := CleanPhoneNumber(to)
	if p.cfg.PhoneNumberID == "" || p.cfg.AccessToken == "" {
		return fmt.Sprintf("wamid.mock_doc_%d", time.Now().UnixNano()), nil
	}

	url := fmt.Sprintf("https://graph.facebook.com/v21.0/%s/messages", p.cfg.PhoneNumberID)
	payload := map[string]interface{}{
		"messaging_product": "whatsapp",
		"recipient_type":    "individual",
		"to":                cleanPhone,
		"type":              "document",
		"document": map[string]string{
			"link":     docURL,
			"filename": filename,
			"caption":  caption,
		},
	}

	bodyBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	req.Header.Set("Authorization", "Bearer "+p.cfg.AccessToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	return fmt.Sprintf("wamid.meta_doc_%d", time.Now().UnixNano()), nil
}
