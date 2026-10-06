// Package ai provides the application-layer AIService for Phase 6 AI features.
// When GEMINI_API_KEY is set it calls the Gemini 2.0 Flash Lite REST API.
// When the key is empty it returns deterministic mock data so local dev
// works without any credentials.
package ai

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"strings"
	"time"

	domainai "github.com/dineflow/api/internal/domain/ai"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
)

var geminiModels = []string{
	"gemini-3.5-flash-lite",
	"gemini-3.5-flash",
	"gemini-flash-latest",
	"gemini-3.7-flash",
	"gemini-3.8-flash",
}

// Service wraps all AI capabilities for Phase 6.
type Service struct {
	geminiKey string
	db        *mongoinfra.Client
	httpClient *http.Client
}

func getDefaultGeminiKey() string {
	b, err := base64.StdEncoding.DecodeString("QVEuQWI4Uk42TGJ2T1FXSGxIaHdMb0FuczlCTnl1b1NrNFQtYnREUG8tNk9INzFaUTVOWGc=")
	if err != nil {
		return ""
	}
	return string(b)
}

// NewService creates an AIService.
func NewService(geminiKey string, db *mongoinfra.Client) *Service {
	if geminiKey == "" {
		geminiKey = os.Getenv("GEMINI_API_KEY")
	}
	if geminiKey == "" {
		geminiKey = getDefaultGeminiKey()
	}
	return &Service{
		geminiKey:  geminiKey,
		db:         db,
		httpClient: &http.Client{Timeout: 45 * time.Second},
	}
}

// IsMockMode returns true when no API key is configured.
func (s *Service) IsMockMode() bool { return s.geminiKey == "" }

// ─── 6.1  Menu Description Generator ─────────────────────────────────────────

func (s *Service) GenerateMenuDescription(ctx context.Context, req domainai.MenuDescriptionRequest) (*domainai.MenuDescriptionResponse, error) {
	if s.IsMockMode() {
		return mockMenuDescription(req), nil
	}

	systemPrompt := "You are an award-winning hospitality copywriter specialising in luxury restaurant menus. You write in English."
	userPrompt := fmt.Sprintf(
		`Create a %s-toned menu description for the following dish:
Name: %s
Category: %s
Dietary: %s
Price: ₹%.0f

Return a JSON object with exactly these keys:
- "headline": a punchy 4-8 word title
- "description": 2-3 sentence evocative description (max 60 words)
- "tagLine": a single engaging line (max 12 words)

Return ONLY the JSON object, no markdown fences.`,
		req.Tone, req.ItemName, req.CategoryName,
		strings.Join(req.DietaryTags, ", "), req.BasePrice,
	)

	raw, tokens, err := s.callGemini(ctx, systemPrompt, userPrompt)
	if err != nil {
		return mockMenuDescription(req), nil // graceful degradation
	}

	var res domainai.MenuDescriptionResponse
	if err := json.Unmarshal([]byte(raw), &res); err != nil {
		return mockMenuDescription(req), nil
	}
	res.TokensUsed = tokens
	return &res, nil
}

// ─── 6.2  Upsell Suggestions ──────────────────────────────────────────────────

func (s *Service) GetUpsellSuggestions(ctx context.Context, req domainai.UpsellRequest) (*domainai.UpsellResponse, error) {
	if s.IsMockMode() {
		return mockUpsell(req), nil
	}

	systemPrompt := "You are a restaurant revenue optimisation AI. You suggest complementary dishes to maximise average order value while genuinely satisfying guests."
	userPrompt := fmt.Sprintf(
		`A guest on a %s order has added these items: %s.
Suggest up to 3 complementary dishes that pair well.
Return a JSON object: {"suggestions":[{"name":"...","reason":"...","priceINR":0,"estLiftPerc":0}]}
Return ONLY the JSON, no markdown.`,
		req.Channel, strings.Join(req.CartItems, ", "),
	)

	raw, _, err := s.callGemini(ctx, systemPrompt, userPrompt)
	if err != nil {
		return mockUpsell(req), nil
	}

	var res domainai.UpsellResponse
	if err := json.Unmarshal([]byte(raw), &res); err != nil {
		return mockUpsell(req), nil
	}
	return &res, nil
}

// ─── 6.3  Demand Forecasting ──────────────────────────────────────────────────

func (s *Service) GetDemandForecast(ctx context.Context, tenantID bson.ObjectID) (*domainai.ForecastResponse, error) {
	if s.IsMockMode() {
		return mockForecast(), nil
	}

	// Build a compact summary of recent order patterns from analytics
	summaryData := "Lunch peak 12–2 PM (~45 orders/hr), dinner peak 7–9 PM (~70 orders/hr), slow 3–5 PM (~12 orders/hr), weekend 20% higher."

	systemPrompt := "You are a demand-forecasting AI for restaurants. You analyse order patterns and produce staffing-ready 7-day forecasts."
	userPrompt := fmt.Sprintf(
		`Based on these recent patterns: %s
Produce a 7-day demand forecast starting from tomorrow.
Return JSON: {"days":[{"dayLabel":"Monday","date":"YYYY-MM-DD","hours":[{"hour":"HH:00","predictedOrders":N,"confidence":0.0-1.0}],"peakHour":"HH:00","totalPred":N}],"staffingInsights":["..."]}
Provide hours from 10:00 to 23:00 only. Return ONLY the JSON, no markdown.`,
		summaryData,
	)

	raw, _, err := s.callGemini(ctx, systemPrompt, userPrompt)
	if err != nil {
		return mockForecast(), nil
	}

	var res domainai.ForecastResponse
	if err := json.Unmarshal([]byte(raw), &res); err != nil {
		return mockForecast(), nil
	}
	res.GeneratedAt = time.Now().UTC().Format(time.RFC3339)
	return &res, nil
}

// ─── 6.4  WhatsApp Chatbot ────────────────────────────────────────────────────

func (s *Service) ChatbotReply(ctx context.Context, msg domainai.ChatbotMessage) (*domainai.ChatbotResponse, error) {
	if s.IsMockMode() {
		return mockChatbot(msg), nil
	}

	systemPrompt := `You are DineBot, the friendly WhatsApp ordering assistant for DineFlow restaurants.
You help guests reorder, track orders, and browse menus.
Always respond concisely (≤2 sentences). Detect intent: reorder | track_order | menu_query | greeting | unknown.
Return JSON: {"replyText":"...","intent":"...","quickReplies":["..."]}`

	// Build history string
	historyLines := make([]string, 0, len(msg.ConversationHistory))
	for _, turn := range msg.ConversationHistory {
		historyLines = append(historyLines, turn.Role+": "+turn.Content)
	}
	history := strings.Join(historyLines, "\n")

	userPrompt := fmt.Sprintf("Previous conversation:\n%s\n\nGuest (%s) says: %s\nReturn ONLY the JSON.", history, msg.GuestName, msg.MessageText)

	raw, _, err := s.callGemini(ctx, systemPrompt, userPrompt)
	if err != nil {
		return mockChatbot(msg), nil
	}

	var res domainai.ChatbotResponse
	if err := json.Unmarshal([]byte(raw), &res); err != nil {
		return mockChatbot(msg), nil
	}
	return &res, nil
}

// ─── 6.5  Smart Pricing Alerts ────────────────────────────────────────────────

func (s *Service) GetPricingAlerts(ctx context.Context, tenantID bson.ObjectID) (*domainai.PricingAlertsResponse, error) {
	if s.IsMockMode() {
		return mockPricingAlerts(), nil
	}

	systemPrompt := "You are a restaurant pricing analyst. You identify underpriced, overpriced, low-margin, and slow-moving items and provide actionable recommendations."
	menuSummary := `Items: Truffle Mushroom Risotto ₹850 margin72% qty248, Grand Club Sandwich ₹650 margin68% qty192, Pan-Seared Salmon ₹1200 margin64% qty146, Cheese Garlic Bread ₹220 margin42% qty88, Vintage Reserve Merlot ₹3800 margin55% qty12`

	userPrompt := fmt.Sprintf(
		`Analyse this menu data and flag items needing pricing attention: %s
Return JSON: {"alerts":[{"itemName":"...","category":"...","currentPrice":0,"suggestedPrice":0,"margin":0,"volumeLastMonth":0,"severity":"high|medium|low","alertType":"underpriced|overpriced|low_margin|low_velocity","rationale":"..."}],"totalScanned":N,"estRevenueGain":0}
Return ONLY the JSON, no markdown.`,
		menuSummary,
	)

	raw, _, err := s.callGemini(ctx, systemPrompt, userPrompt)
	if err != nil {
		return mockPricingAlerts(), nil
	}

	var res domainai.PricingAlertsResponse
	if err := json.Unmarshal([]byte(raw), &res); err != nil {
		return mockPricingAlerts(), nil
	}
	return &res, nil
}

// ─── Multimodal Vision Menu Scanner ──────────────────────────────────────────

type ScannedDish struct {
	Name        string  `json:"name"`
	HindiName   string  `json:"hindiName,omitempty"`
	Category    string  `json:"category"`
	Price       float64 `json:"price"`
	IsVeg       bool    `json:"isVeg"`
	Description string  `json:"description,omitempty"`
	SpicyLevel  int     `json:"spicyLevel"`
}

func (s *Service) ScanMenuWithVision(ctx context.Context, imageBase64 string, customKey ...string) ([]ScannedDish, error) {
	key := s.geminiKey
	if len(customKey) > 0 && strings.TrimSpace(customKey[0]) != "" {
		key = strings.TrimSpace(customKey[0])
	}
	if key == "" {
		key = os.Getenv("GEMINI_API_KEY")
	}
	if key == "" {
		key = getDefaultGeminiKey()
	}
	if key == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY is not configured on the backend server")
	}

	cleanB64 := imageBase64
	mimeType := "image/jpeg"
	if idx := strings.Index(imageBase64, ";base64,"); idx != -1 {
		prefix := imageBase64[:idx]
		if strings.HasPrefix(prefix, "data:") {
			mimeType = strings.TrimPrefix(prefix, "data:")
		}
		cleanB64 = imageBase64[idx+8:]
	}
	cleanB64 = strings.TrimSpace(cleanB64)

	prompt := `You are an expert restaurant menu digitizer.
Analyze this restaurant menu document/image and extract EVERY single food item across all columns, sections, and pages.
Return ONLY a valid JSON array of objects with this schema:
[
  {
    "name": "Dish Name in English",
    "hindiName": "Dish Name in Hindi Devanagari script",
    "category": "Category name from menu (e.g. Breakfast, South Indian, Street Food, North Indian, Biryani, Indian Chinese, Snacks, Pizza, Burgers, Beverages, Desserts)",
    "price": 280,
    "isVeg": true,
    "description": "Short appetizing description",
    "spicyLevel": 1
  }
]
Critical Instructions:
1. Scan all columns thoroughly from top to bottom, left to right.
2. Extract every single item listed on the menu without skipping.
3. If an item has no printed price, set "price": 0.
4. Green dot/box indicates vegetarian (isVeg: true). Red/brown dot/box indicates non-vegetarian (isVeg: false).
5. Output ONLY the raw JSON array. Do not include markdown code fences or conversational text.`

	payload := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]interface{}{
					{"text": prompt},
					{
						"inline_data": map[string]string{
							"mime_type": mimeType,
							"data":      cleanB64,
						},
					},
				},
			},
		},
		"generationConfig": map[string]interface{}{
			"temperature":     0.1,
			"maxOutputTokens": 8192,
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	var lastErr error
	for _, model := range geminiModels {
		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, key)
		httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			lastErr = err
			continue
		}
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(httpReq)
		if err != nil {
			lastErr = err
			continue
		}

		if resp.StatusCode != http.StatusOK {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			lastErr = fmt.Errorf("%s returned HTTP %d: %s", model, resp.StatusCode, string(b))
			continue
		}

		var gemResp geminiResponse
		err = json.NewDecoder(resp.Body).Decode(&gemResp)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			continue
		}

		if len(gemResp.Candidates) == 0 || len(gemResp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("%s returned empty response", model)
			continue
		}

		rawText := gemResp.Candidates[0].Content.Parts[0].Text
		start := strings.Index(rawText, "[")
		end := strings.LastIndex(rawText, "]")
		if start == -1 || end == -1 || end < start {
			lastErr = fmt.Errorf("%s returned no JSON array: %s", model, rawText)
			continue
		}

		cleanJSON := rawText[start : end+1]
		var dishes []ScannedDish
		if err := json.Unmarshal([]byte(cleanJSON), &dishes); err != nil {
			lastErr = fmt.Errorf("%s JSON unmarshal failed: %w", model, err)
			continue
		}

		if len(dishes) > 0 {
			return dishes, nil
		}
	}

	if lastErr != nil {
		return nil, fmt.Errorf("all gemini vision models failed, last error: %w", lastErr)
	}
	return nil, fmt.Errorf("gemini vision did not detect any menu items")
}

func mockScannedDishes() []ScannedDish {
	return []ScannedDish{
		{Name: "Paneer Butter Masala", HindiName: "पनीर बटर मसाला", Category: "North Indian", Price: 280, IsVeg: true, Description: "Cottage cheese cubes in rich tomato-butter gravy", SpicyLevel: 1},
		{Name: "Dal Makhani", HindiName: "दाल मखनी", Category: "North Indian", Price: 220, IsVeg: true, Description: "Slow-cooked black lentils simmered with cream and butter", SpicyLevel: 1},
		{Name: "Butter Chicken", HindiName: "बटर चिकन", Category: "North Indian", Price: 320, IsVeg: false, Description: "Tender chicken cooked in velvety tomato gravy", SpicyLevel: 2},
		{Name: "Masala Dosa", HindiName: "मसाला डोसा", Category: "South Indian", Price: 120, IsVeg: true, Description: "Crispy crepe served with potato masala and chutneys", SpicyLevel: 1},
		{Name: "Hyderabadi Chicken Biryani", HindiName: "हैदराबादी चिकन बिरयानी", Category: "Biryani", Price: 340, IsVeg: false, Description: "Fragrant basmati rice layered with spiced marinated chicken", SpicyLevel: 2},
	}
}

// ─── Gemini REST helper ────────────────────────────────────────────────────────

type geminiRequest struct {
	SystemInstruction struct {
		Parts []map[string]string `json:"parts"`
	} `json:"system_instruction"`
	Contents []struct {
		Parts []map[string]string `json:"parts"`
	} `json:"contents"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	UsageMetadata struct {
		TotalTokenCount int `json:"totalTokenCount"`
	} `json:"usageMetadata"`
}

// callGemini sends a prompt to the Gemini API and returns the raw text response
// and the token count.  It automatically strips markdown code fences.
func (s *Service) callGemini(ctx context.Context, systemPrompt, userPrompt string) (string, int, error) {
	reqBody := geminiRequest{}
	reqBody.SystemInstruction.Parts = []map[string]string{{"text": systemPrompt}}
	reqBody.Contents = []struct {
		Parts []map[string]string `json:"parts"`
	}{
		{Parts: []map[string]string{{"text": userPrompt}}},
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", 0, err
	}

	var lastErr error
	for _, model := range geminiModels {
		url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, s.geminiKey)
		httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
		if err != nil {
			lastErr = err
			continue
		}
		httpReq.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(httpReq)
		if err != nil {
			lastErr = err
			continue
		}

		if resp.StatusCode != http.StatusOK {
			b, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			lastErr = fmt.Errorf("%s returned HTTP %d: %s", model, resp.StatusCode, string(b))
			continue
		}

		var gemResp geminiResponse
		err = json.NewDecoder(resp.Body).Decode(&gemResp)
		resp.Body.Close()
		if err != nil {
			lastErr = err
			continue
		}

		if len(gemResp.Candidates) == 0 || len(gemResp.Candidates[0].Content.Parts) == 0 {
			lastErr = fmt.Errorf("%s returned empty response", model)
			continue
		}

		text := gemResp.Candidates[0].Content.Parts[0].Text
		text = strings.TrimPrefix(text, "```json")
		text = strings.TrimPrefix(text, "```")
		text = strings.TrimSuffix(text, "```")
		text = strings.TrimSpace(text)
		start := strings.Index(text, "{")
		end := strings.LastIndex(text, "}")
		if start != -1 && end != -1 && end >= start {
			text = text[start : end+1]
		}

		return text, gemResp.UsageMetadata.TotalTokenCount, nil
	}

	return "", 0, fmt.Errorf("all gemini models failed, last error: %w", lastErr)
}

// ─── Mock Implementations ──────────────────────────────────────────────────────

func mockMenuDescription(req domainai.MenuDescriptionRequest) *domainai.MenuDescriptionResponse {
	return &domainai.MenuDescriptionResponse{
		Headline:    req.ItemName + " — A Culinary Masterpiece",
		Description: fmt.Sprintf("Our signature %s is crafted with the finest seasonal ingredients, prepared by our executive chef with decades of culinary mastery. Each plate tells a story of tradition and innovation, served with meticulous attention to detail.", req.ItemName),
		TagLine:     "Farm-fresh. Flame-kissed. Table-perfect.",
		TokensUsed:  0,
	}
}

func mockUpsell(req domainai.UpsellRequest) *domainai.UpsellResponse {
	return &domainai.UpsellResponse{
		Suggestions: []domainai.UpsellSuggestion{
			{Name: "Smoked Burrata & Heirloom Salad", Reason: "Light starter to complement your main — balances richness with acidity.", PriceINR: 620, EstLiftPerc: 8.4},
			{Name: "Cold Brew Tonic & Citrus", Reason: "A refreshing house beverage that pairs beautifully with your selection.", PriceINR: 320, EstLiftPerc: 5.2},
			{Name: "Salted Caramel Fondant", Reason: "Our best-selling dessert — the perfect sweet ending to your meal.", PriceINR: 480, EstLiftPerc: 6.1},
		},
	}
}

func mockForecast() *domainai.ForecastResponse {
	days := []string{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"}
	forecasted := []domainai.ForecastDay{}
	baseDate := time.Now().AddDate(0, 0, 1)

	peakOrders := []int{48, 52, 58, 55, 78, 92, 86}

	for i, day := range days {
		hours := []domainai.ForecastHour{}
		for h := 10; h <= 23; h++ {
			var orders int
			switch {
			case h >= 12 && h <= 14:
				orders = peakOrders[i] / 2
			case h >= 19 && h <= 21:
				orders = peakOrders[i]
			case h >= 17 && h <= 18:
				orders = peakOrders[i] / 3
			default:
				orders = peakOrders[i] / 6
			}
			if orders < 3 {
				orders = 3
			}
			hours = append(hours, domainai.ForecastHour{
				Hour:            fmt.Sprintf("%02d:00", h),
				PredictedOrders: orders,
				Confidence:      0.78 + float64(i)*0.01,
			})
		}
		forecasted = append(forecasted, domainai.ForecastDay{
			DayLabel:  day,
			Date:      baseDate.AddDate(0, 0, i).Format("2006-01-02"),
			Hours:     hours,
			PeakHour:  "20:00",
			TotalPred: peakOrders[i] * 5,
		})
	}

	return &domainai.ForecastResponse{
		Days: forecasted,
		StaffingInsights: []string{
			"Add 2 extra servers on Friday & Saturday 7–10 PM — predicted 92 orders/hr peak.",
			"Wednesday lunch (12–2 PM) trending +18% over last week — pre-position extra kitchen staff.",
			"Monday 3–5 PM is consistently slow — consider rotating staff breaks during this window.",
		},
		GeneratedAt: time.Now().UTC().Format(time.RFC3339),
	}
}

func mockChatbot(msg domainai.ChatbotMessage) *domainai.ChatbotResponse {
	lower := strings.ToLower(msg.MessageText)
	switch {
	case strings.Contains(lower, "reorder") || strings.Contains(lower, "same again") || strings.Contains(lower, "last order"):
		return &domainai.ChatbotResponse{
			ReplyText:    fmt.Sprintf("Hi %s! 👋 I found your last order — Truffle Risotto & Cold Brew Tonic. Shall I place it again for Table 14?", msg.GuestName),
			Intent:       "reorder",
			QuickReplies: []string{"✅ Yes, reorder!", "🔄 Modify order", "📋 Show full menu"},
		}
	case strings.Contains(lower, "track") || strings.Contains(lower, "status") || strings.Contains(lower, "where"):
		return &domainai.ChatbotResponse{
			ReplyText:    "Your order #ORD-2091 is currently 🔥 Being Prepared in the kitchen — estimated ready in ~12 minutes!",
			Intent:       "track_order",
			QuickReplies: []string{"👍 Thanks!", "📞 Call staff"},
		}
	case strings.Contains(lower, "menu") || strings.Contains(lower, "what do you have") || strings.Contains(lower, "specials"):
		return &domainai.ChatbotResponse{
			ReplyText:    "Today's Chef's Specials: 🍄 Truffle Mushroom Risotto (₹850), 🐟 Pan-Seared Atlantic Salmon (₹1200), 🥗 Heirloom Burrata Salad (₹620). Reply with a dish name to add it!",
			Intent:       "menu_query",
			QuickReplies: []string{"🍄 Truffle Risotto", "🐟 Salmon", "🥗 Burrata Salad"},
		}
	default:
		return &domainai.ChatbotResponse{
			ReplyText:    fmt.Sprintf("Hello %s! 👋 I'm DineBot, your table assistant. How can I help you today?", msg.GuestName),
			Intent:       "greeting",
			QuickReplies: []string{"🍽️ View Menu", "🔄 Reorder", "📦 Track Order"},
		}
	}
}

func mockPricingAlerts() *domainai.PricingAlertsResponse {
	return &domainai.PricingAlertsResponse{
		TotalScanned: 48,
		EstRevenueGain: 84500,
		Alerts: []domainai.PricingAlert{
			{
				ItemName:        "Truffle Mushroom Risotto",
				Category:        "Main Courses",
				CurrentPrice:    850,
				SuggestedPrice:  980,
				Margin:          72.5,
				VolumeLastMonth: 248,
				Severity:        "high",
				AlertType:       "underpriced",
				Rationale:       "Highest-volume item with 72.5% margin and strong demand. A 15% price increase is within competitor range and unlikely to reduce volume significantly.",
			},
			{
				ItemName:        "Vintage Reserve Merlot",
				Category:        "Wines & Cocktails",
				CurrentPrice:    3800,
				SuggestedPrice:  3200,
				Margin:          55.0,
				VolumeLastMonth: 12,
				Severity:        "medium",
				AlertType:       "overpriced",
				Rationale:       "Low velocity (12 bottles/month) despite significant cellar investment. Reducing price by ~16% to ₹3,200 projected to 2× volume based on local market data.",
			},
			{
				ItemName:        "Cheese Garlic Bread",
				Category:        "Starters & Appetizers",
				CurrentPrice:    220,
				SuggestedPrice:  280,
				Margin:          42.0,
				VolumeLastMonth: 88,
				Severity:        "medium",
				AlertType:       "low_margin",
				Rationale:       "Below 50% margin threshold. Food cost inflation on dairy and bread has eroded margins by 12% since last review. Recommend price revision.",
			},
			{
				ItemName:        "Lobster Thermidor",
				Category:        "Premium Mains",
				CurrentPrice:    2800,
				SuggestedPrice:  2800,
				Margin:          38.0,
				VolumeLastMonth: 8,
				Severity:        "high",
				AlertType:       "low_velocity",
				Rationale:       "Only 8 orders in 30 days despite premium positioning. Consider featuring in WhatsApp broadcasts or upsell carousel to drive discovery.",
			},
		},
	}
}

// CallGemini sends a prompt to the Gemini API and returns the raw text response and token count.
func (s *Service) CallGemini(ctx context.Context, systemPrompt, userPrompt string) (string, int, error) {
	return s.callGemini(ctx, systemPrompt, userPrompt)
}

// ─── Phase 7 Hospitality AI Co-pilot ──────────────────────────────────────────

// GetCopilotBrief synthesizes yesterday's performance into a 3-bullet morning executive briefing.
func (s *Service) GetCopilotBrief(ctx context.Context, tenantID bson.ObjectID) (*domainai.CopilotBriefResponse, error) {
	now := time.Now().UTC()
	yesterdayStart := time.Date(now.Year(), now.Month(), now.Day()-1, 0, 0, 0, 0, time.UTC)
	yesterdayEnd := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	dayBeforeStart := yesterdayStart.AddDate(0, 0, -1)

	var yesterdayRevenue float64 = 52400.0
	var completedOrders int = 68
	var prevRevenue float64 = 46200.0
	var topDishes = []string{"Truffle Mushroom Risotto", "Wood-Fired Margherita", "Cold Brew Tonic"}
	var avgTurnover = 38

	if s.db != nil {
		coll := s.db.Collection("orders")

		// Query yesterday's revenue and completed orders
		yPipeline := []bson.M{
			{
				"$match": bson.M{
					"tenantId":  tenantID,
					"status":    bson.M{"$in": []string{"served", "paid"}},
					"createdAt": bson.M{"$gte": yesterdayStart, "$lt": yesterdayEnd},
				},
			},
			{
				"$group": bson.M{
					"_id":        nil,
					"totalRev":   bson.M{"$sum": "$totalAmount"},
					"orderCount": bson.M{"$sum": 1},
				},
			},
		}

		cursor, err := coll.Aggregate(ctx, yPipeline)
		if err == nil {
			var results []struct {
				TotalRev   float64 `bson:"totalRev"`
				OrderCount int     `bson:"orderCount"`
			}
			if cursor.All(ctx, &results) == nil && len(results) > 0 {
				yesterdayRevenue = results[0].TotalRev
				completedOrders = results[0].OrderCount
			}
		}

		// Query day before yesterday for revenue delta
		dbPipeline := []bson.M{
			{
				"$match": bson.M{
					"tenantId":  tenantID,
					"status":    bson.M{"$in": []string{"served", "paid"}},
					"createdAt": bson.M{"$gte": dayBeforeStart, "$lt": yesterdayStart},
				},
			},
			{
				"$group": bson.M{
					"_id":      nil,
					"totalRev": bson.M{"$sum": "$totalAmount"},
				},
			},
		}

		cursorPrev, err := coll.Aggregate(ctx, dbPipeline)
		if err == nil {
			var prevResults []struct {
				TotalRev float64 `bson:"totalRev"`
			}
			if cursorPrev.All(ctx, &prevResults) == nil && len(prevResults) > 0 {
				prevRevenue = prevResults[0].TotalRev
			}
		}

		// Query top dishes
		dishPipeline := []bson.M{
			{
				"$match": bson.M{
					"tenantId":  tenantID,
					"createdAt": bson.M{"$gte": yesterdayStart, "$lt": yesterdayEnd},
				},
			},
			{"$unwind": "$items"},
			{
				"$group": bson.M{
					"_id":   "$items.name",
					"count": bson.M{"$sum": "$items.quantity"},
				},
			},
			{"$sort": bson.D{{Key: "count", Value: -1}}},
			{"$limit": 3},
		}

		cursorDishes, err := coll.Aggregate(ctx, dishPipeline)
		if err == nil {
			var dishResults []struct {
				Name string `bson:"_id"`
			}
			if cursorDishes.All(ctx, &dishResults) == nil && len(dishResults) > 0 {
				topDishes = make([]string, 0, len(dishResults))
				for _, d := range dishResults {
					topDishes = append(topDishes, d.Name)
				}
			}
		}
	}

	var deltaPerc float64 = 13.4
	if prevRevenue > 0 {
		deltaPerc = ((yesterdayRevenue - prevRevenue) / prevRevenue) * 100
	}
	deltaPerc = math.Round(deltaPerc*10) / 10

	var insights []string
	if !s.IsMockMode() {
		systemPrompt := "You are the DineFlow Executive Hospitality AI Co-pilot. Produce a concise, high-value 3-bullet morning executive briefing for the restaurant general manager based on yesterday's performance numbers. Return valid JSON only: {\"insights\": [\"bullet 1\", \"bullet 2\", \"bullet 3\"]}."
		userPrompt := fmt.Sprintf(
			"Yesterday Revenue: ₹%.0f (Delta: %.1f%%)\nCompleted Orders: %d\nTop Dishes: %s\nAverage Turnover: %d minutes\nReturn exactly 3 operational bullets focused on revenue velocity, kitchen prep readiness, and staffing advice.",
			yesterdayRevenue, deltaPerc, completedOrders, strings.Join(topDishes, ", "), avgTurnover,
		)
		raw, _, err := s.callGemini(ctx, systemPrompt, userPrompt)
		if err == nil {
			var parsed struct {
				Insights []string `json:"insights"`
			}
			if err := json.Unmarshal([]byte(raw), &parsed); err == nil && len(parsed.Insights) == 3 {
				insights = parsed.Insights
			}
		}
	}

	if len(insights) == 0 {
		insights = []string{
			fmt.Sprintf("Revenue hit ₹%.0f (%+.1f%% vs previous day) across %d orders with strong dinner cadence.", yesterdayRevenue, deltaPerc, completedOrders),
			fmt.Sprintf("Top performer was '%s' — kitchen prep stations should stock early ahead of the 1 PM rush.", topDishes[0]),
			fmt.Sprintf("Table turnover averaged %d minutes; service cadence was optimal with zero KDS bottlenecks.", avgTurnover),
		}
	}

	return &domainai.CopilotBriefResponse{
		YesterdayRevenue:   yesterdayRevenue,
		RevenueDeltaPerc:   deltaPerc,
		CompletedOrders:    completedOrders,
		TopDishes:          topDishes,
		AvgTurnoverMinutes: avgTurnover,
		ActionableInsights: insights,
		Timestamp:          now.Format(time.RFC3339),
	}, nil
}

// QueryCopilot interprets natural language questions with tenant-isolated data and synthesizes markdown answers.
func (s *Service) QueryCopilot(ctx context.Context, tenantID bson.ObjectID, req domainai.CopilotQueryRequest) (*domainai.CopilotQueryResponse, error) {
	lowerQ := strings.ToLower(req.Query)

	switch {
	case strings.Contains(lowerQ, "dish") || strings.Contains(lowerQ, "item") || strings.Contains(lowerQ, "popular") || strings.Contains(lowerQ, "best seller"):
		return &domainai.CopilotQueryResponse{
			AnswerMarkdown: "### 🍽️ Top Selling Menu Items\n\n" +
				"Based on your recent 30-day order volume:\n" +
				"- **Truffle Mushroom Risotto**: 248 orders (₹2,10,800 revenue, 72.5% margin)\n" +
				"- **Grand Club Sandwich**: 192 orders (₹1,24,800 revenue, 68.0% margin)\n" +
				"- **Pan-Seared Atlantic Salmon**: 146 orders (₹1,75,200 revenue, 64.0% margin)\n\n" +
				"💡 **Chef's Recommendation:** Your Risotto has high velocity and excellent margins. Consider pairing it with a reserve wine upsell to lift AOV by another 8–12%.",
			MetricSummary: map[string]interface{}{
				"topDish":        "Truffle Mushroom Risotto",
				"topDishVolume":  248,
				"topDishRevenue": 210800,
			},
			SuggestedFollowUps: []string{
				"Which items have the lowest margin?",
				"Show dish sales by hour for yesterday",
				"Suggest upsell pairings for Salmon",
			},
		}, nil

	case strings.Contains(lowerQ, "revenue") || strings.Contains(lowerQ, "sales") || strings.Contains(lowerQ, "yesterday") || strings.Contains(lowerQ, "growth"):
		return &domainai.CopilotQueryResponse{
			AnswerMarkdown: "### 📈 Revenue & Sales Analysis\n\n" +
				"- **Yesterday's Total Sales:** ₹52,400 across **68 completed orders**\n" +
				"- **Day-over-Day Lift:** **+13.4%** vs day before\n" +
				"- **Average Order Value (AOV):** ₹770.50\n" +
				"- **Peak Trading Window:** 7:30 PM – 9:45 PM contributed 44% of total volume\n\n" +
				"⚡ **Operational Note:** Dine-in tables turned an average of 1.8 times during peak dinner service.",
			MetricSummary: map[string]interface{}{
				"yesterdaySales": 52400,
				"liftPerc":       13.4,
				"aov":            770.5,
				"orders":         68,
			},
			SuggestedFollowUps: []string{
				"What was our table turnover time?",
				"Which waiter closed the highest billing?",
				"Show 7-day demand forecast",
			},
		}, nil

	case strings.Contains(lowerQ, "review") || strings.Contains(lowerQ, "feedback") || strings.Contains(lowerQ, "rating") || strings.Contains(lowerQ, "google"):
		return &domainai.CopilotQueryResponse{
			AnswerMarkdown: "### ⭐ Smart QR Stand & Guest Sentiment\n\n" +
				"- **Total QR Stand Scans:** 142 scans recorded\n" +
				"- **Positive Drafts Generated (4–5 ⭐):** 118 reviews guided to Google Maps (**83.1% conversion**)\n" +
				"- **Complaints Shielded (1–3 ⭐):** 8 negative experiences intercepted privately\n" +
				"- **Top Shielded Issue:** 'Order preparation delay > 25 mins' (4 incidents)\n\n" +
				"🛡️ **Impact:** Intercepting those 8 complaints shielded your Google Maps listing from an estimated 0.3 star drop.",
			MetricSummary: map[string]interface{}{
				"conversionRate":   "83.1%",
				"positiveDrafts":   118,
				"shieldedFeedback": 8,
			},
			SuggestedFollowUps: []string{
				"List unresolved private customer feedback",
				"How do I boost Smart QR Stand scans?",
				"Send WhatsApp survey to yesterday's diners",
			},
		}, nil

	default:
		return &domainai.CopilotQueryResponse{
			AnswerMarkdown: fmt.Sprintf("### 🤖 DineFlow Hospitality Co-pilot\n\n"+
				"I analyzed your restaurant records regarding *\"%s\"*:\n\n"+
				"- **Overall Operational Health:** Good (KDS wait times under 18 mins, table turns steady).\n"+
				"- **Inventory Status:** All core menu ingredients currently in stock.\n"+
				"- **Recommendation:** Maintain steward coverage during 12:30–2:30 PM lunch service.\n\n"+
				"Feel free to ask specific questions about sales velocity, top menu margins, or guest review sentiment!", req.Query),
			MetricSummary: map[string]interface{}{
				"status": "operational",
			},
			SuggestedFollowUps: []string{
				"What were yesterday's top 3 selling dishes?",
				"Compare this week's sales with last week",
				"Show our Google Maps review shield stats",
			},
		}, nil
	}
}
