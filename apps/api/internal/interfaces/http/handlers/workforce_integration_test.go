package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	appwa "github.com/dineflow/api/internal/application/whatsapp"
	"github.com/dineflow/api/internal/interfaces/http/handlers"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func setupTestRouter() (*gin.Engine, *appwa.Service) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(middleware.NoSQLSanitizer())

	waService := appwa.NewService(nil)
	waHandler := handlers.NewWhatsAppHandler(waService)

	v1 := r.Group("/api/v1")
	{
		v1.GET("/whatsapp/webhook", waHandler.VerifyWebhook)
		v1.POST("/whatsapp/webhook", waHandler.HandleWebhook)
		v1.GET("/workforce/verify-token", waHandler.VerifyCheckInToken)
		v1.POST("/workforce/check-in", waHandler.PublicWorkforceCheckIn)
	}

	return r, waService
}

func TestVerifyWebhookChallenge(t *testing.T) {
	router, _ := setupTestRouter()

	req, _ := http.NewRequest(http.MethodGet, "/api/v1/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=dineflow_webhook_verify_secret&hub.challenge=12345678", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}
	if w.Body.String() != "12345678" {
		t.Fatalf("Expected body '12345678', got %q", w.Body.String())
	}
}

func TestVerifyCheckInTokenHandler(t *testing.T) {
	router, waService := setupTestRouter()

	// 1. Invalid token should return 400
	req, _ := http.NewRequest(http.MethodGet, "/api/v1/workforce/verify-token?token=invalid_token", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 for invalid token, got %d", w.Code)
	}

	// 2. Valid token should return 200 with details
	tenantID := bson.NewObjectID()
	userID := bson.NewObjectID()
	token, err := waService.GenerateCheckInToken(tenantID, userID, "DF-EMP-1002", "clock_in")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	req2, _ := http.NewRequest(http.MethodGet, "/api/v1/workforce/verify-token?token="+token, nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	if w2.Code != http.StatusOK {
		t.Errorf("Expected 200 for valid token, got %d: %s", w2.Code, w2.Body.String())
	}

	var resp struct {
		Data struct {
			Valid         bool    `json:"valid"`
			EmployeeID    string  `json:"employeeId"`
			Action        string  `json:"action"`
			RadiusMeters  float64 `json:"radiusMeters"`
			WorkplaceName string  `json:"workplaceName"`
		} `json:"data"`
	}
	if err := json.Unmarshal(w2.Body.Bytes(), &resp); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if !resp.Data.Valid {
		t.Error("Expected token to be valid")
	}
	if resp.Data.EmployeeID != "DF-EMP-1002" {
		t.Errorf("Expected employeeId DF-EMP-1002, got %s", resp.Data.EmployeeID)
	}
	if resp.Data.Action != "clock_in" {
		t.Errorf("Expected action clock_in, got %s", resp.Data.Action)
	}
}

func TestDualModeWebhookRouter(t *testing.T) {
	router, _ := setupTestRouter()

	// Customer message (unknown phone) -> routes to DineBot
	customerPayload := map[string]interface{}{
		"fromNumber":  "+91 88888 77777",
		"messageText": "hi",
	}
	body, _ := json.Marshal(customerPayload)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/whatsapp/webhook", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected status 200, got %d", w.Code)
	}

	var custResp struct {
		Data struct {
			BotReply    string `json:"botReply"`
			ActionTaken string `json:"actionTaken"`
			IsWorkforce bool   `json:"isWorkforce"`
		} `json:"data"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &custResp)
	if !strings.Contains(custResp.Data.BotReply, "Welcome to") {
		t.Errorf("Expected customer reply to contain 'Welcome to', got %s", custResp.Data.BotReply)
	}
	if custResp.Data.IsWorkforce {
		t.Error("Expected IsWorkforce to be false for customer")
	}
}
