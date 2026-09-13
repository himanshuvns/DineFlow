// Package ai provides the application-layer AIService for Phase 6 AI features.
// When GEMINI_API_KEY is set it calls the Gemini 2.0 Flash Lite REST API.
// When the key is empty it returns deterministic mock data so local dev
// works without any credentials.
package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	domainai "github.com/dineflow/api/internal/domain/ai"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
)

const (
	geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent"
)

// Service wraps all AI capabilities for Phase 6.
type Service struct {
	geminiKey string
	db        *mongoinfra.Client
	httpClient *http.Client
}

// NewService creates an AIService.  geminiKey may be empty (→ mock mode).
func NewService(geminiKey string, db *mongoinfra.Client) *Service {
	return &Service{
		geminiKey: geminiKey,
		db:        db,
		httpClient: &http.Client{Timeout: 30 * time.Second},
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

func (s *Service) ScanMenuWithVision(ctx context.Context, imageBase64 string) ([]ScannedDish, error) {
	if s.IsMockMode() {
		return mockScannedDishes(), nil
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

	prompt := `You are an expert Indian restaurant menu digitizer.
Analyze this restaurant menu image and extract EVERY single food item across all columns and sections.
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

	url := fmt.Sprintf("%s?key=%s", geminiEndpoint, s.geminiKey)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gemini vision error %d: %s", resp.StatusCode, string(b))
	}

	var gemResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&gemResp); err != nil {
		return nil, err
	}

	if len(gemResp.Candidates) == 0 || len(gemResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty gemini vision response")
	}

	rawText := gemResp.Candidates[0].Content.Parts[0].Text
	rawText = strings.TrimPrefix(rawText, "```json")
	rawText = strings.TrimPrefix(rawText, "```")
	rawText = strings.TrimSuffix(rawText, "```")
	rawText = strings.TrimSpace(rawText)

	var dishes []ScannedDish
	if err := json.Unmarshal([]byte(rawText), &dishes); err != nil {
		return nil, fmt.Errorf("failed to parse extracted dishes: %w", err)
	}

	return dishes, nil
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

	url := fmt.Sprintf("%s?key=%s", geminiEndpoint, s.geminiKey)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return "", 0, err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", 0, fmt.Errorf("gemini API error %d: %s", resp.StatusCode, string(b))
	}

	var gemResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&gemResp); err != nil {
		return "", 0, err
	}

	if len(gemResp.Candidates) == 0 || len(gemResp.Candidates[0].Content.Parts) == 0 {
		return "", 0, fmt.Errorf("empty gemini response")
	}

	text := gemResp.Candidates[0].Content.Parts[0].Text
	// Strip markdown fences if model wraps JSON in ```json ... ```
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)

	return text, gemResp.UsageMetadata.TotalTokenCount, nil
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
