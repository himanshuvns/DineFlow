package review

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/url"
	"strings"
	"time"
	"unicode"

	aiapp "github.com/dineflow/api/internal/application/ai"
	notifapp "github.com/dineflow/api/internal/application/notification"
	whatsappapp "github.com/dineflow/api/internal/application/whatsapp"
	domainmenu "github.com/dineflow/api/internal/domain/menu"
	domainreview "github.com/dineflow/api/internal/domain/review"
	domaintenant "github.com/dineflow/api/internal/domain/tenant"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Service struct {
	db           *mongoinfra.Client
	aiService    *aiapp.Service
	waService    *whatsappapp.Service
	notifService *notifapp.Service
}

func NewService(db *mongoinfra.Client, aiService *aiapp.Service) *Service {
	return &Service{
		db:        db,
		aiService: aiService,
	}
}

func (s *Service) SetWhatsAppService(wa *whatsappapp.Service) {
	s.waService = wa
}

func (s *Service) SetNotificationService(notif *notifapp.Service) {
	s.notifService = notif
}

// GetPublicRestaurantReviewMeta returns public restaurant information for guest review QR stand.
func (s *Service) GetPublicRestaurantReviewMeta(ctx context.Context, slug string) (*domainreview.PublicRestaurantReviewMeta, error) {
	if s.db == nil {
		return &domainreview.PublicRestaurantReviewMeta{
			TenantID:             bson.NewObjectID().Hex(),
			RestaurantName:       "Sample Bistro",
			Slug:                 slug,
			Cuisine:              "Multi-Cuisine",
			SignatureDishes:      []string{"Chef's Special Pasta", "Garlic Herb Bread"},
			GooglePlaceReviewURL: "https://www.google.com/maps",
			City:                 "Bengaluru",
			PopularTags:          []string{"Delicious Food", "Great Ambience", "Attentive Staff", "Fast Service"},
		}, nil
	}

	coll := s.db.Collection("tenants")
	var t domaintenant.Tenant
	err := coll.FindOne(ctx, bson.M{
		"slug":      slug,
		"deletedAt": bson.M{"$exists": false},
	}).Decode(&t)
	if err != nil {
		return nil, errors.New("restaurant not found")
	}

	// Fetch top available menu items as signature dishes
	menuColl := s.db.Collection("menu_items")
	opts := options.Find().SetLimit(5).SetSort(bson.D{{Key: "displayOrder", Value: 1}})
	cursor, err := menuColl.Find(ctx, bson.M{
		"tenantId":    t.ID,
		"deletedAt":   bson.M{"$exists": false},
		"isAvailable": true,
	}, opts)

	var signatureDishes []string
	if err == nil {
		var items []domainmenu.MenuItem
		if cursor.All(ctx, &items) == nil {
			for _, it := range items {
				signatureDishes = append(signatureDishes, it.Name)
			}
		}
	}
	if len(signatureDishes) == 0 {
		signatureDishes = []string{"Signature Chef's Platter", "House Special Mocktail", "Artisanal Dessert"}
	}

	// Resolve Google Place Review URL
	reviewURL := t.Settings.GooglePlaceReviewURL
	if reviewURL == "" {
		reviewURL = fmt.Sprintf("https://www.google.com/maps/search/?api=1&query=%s+%s",
			url.QueryEscape(t.Name), url.QueryEscape(t.Address.City))
	}

	// Record QR scan event asynchronously
	statsColl := s.db.Collection("reviews_stats")
	_, _ = statsColl.UpdateOne(ctx,
		bson.M{"tenantId": t.ID},
		bson.M{
			"$inc":         bson.M{"totalScans": 1},
			"$setOnInsert": bson.M{"positiveGenerated": 0, "negativeShielded": 0, "updatedAt": time.Now().UTC()},
		},
		options.UpdateOne().SetUpsert(true),
	)

	cuisine := string(t.BusinessType)
	if cuisine == "" {
		cuisine = "Fine Dining & Multi-Cuisine"
	}

	return &domainreview.PublicRestaurantReviewMeta{
		TenantID:             t.ID.Hex(),
		RestaurantName:       t.Name,
		Slug:                 t.Slug,
		Logo:                 t.Logo,
		Cuisine:              cuisine,
		SignatureDishes:      signatureDishes,
		GooglePlaceReviewURL: reviewURL,
		City:                 t.Address.City,
		PopularTags: []string{
			"Delicious Food", "Great Ambience", "Attentive Staff",
			"Fast Service", "Family Friendly", "Worth Every Penny",
		},
	}, nil
}

// GenerateReviewSuggestions produces 3 authentic review drafts using Gemini 2.0 Flash Lite with deterministic fallback.
func (s *Service) GenerateReviewSuggestions(ctx context.Context, req domainreview.GenerateReviewRequest) (*domainreview.GenerateReviewResponse, error) {
	if req.Rating <= 0 {
		req.Rating = 5
	}
	if req.RestaurantName == "" {
		req.RestaurantName = "this restaurant"
	}
	if req.Language == "" {
		req.Language = "en"
	}

	// Record positive draft metric if tenantId provided
	if s.db != nil && req.TenantID != "" {
		if tOID, err := bson.ObjectIDFromHex(req.TenantID); err == nil {
			statsColl := s.db.Collection("reviews_stats")
			_, _ = statsColl.UpdateOne(ctx,
				bson.M{"tenantId": tOID},
				bson.M{"$inc": bson.M{"positiveGenerated": 1}},
				options.UpdateOne().SetUpsert(true),
			)
		}
	}

	googlePlaceURL := fmt.Sprintf("https://www.google.com/maps/search/?api=1&query=%s", url.QueryEscape(req.RestaurantName))

	// Clean & normalize user-selected tags (strip emojis, whitespace)
	var cleanTags []string
	for _, t := range req.Tags {
		c := cleanReviewTag(t)
		if c != "" {
			cleanTags = append(cleanTags, c)
		}
	}
	if len(cleanTags) == 0 {
		cleanTags = []string{"Delicious Food", "Great Hospitality"}
	}
	req.Tags = cleanTags

	// Attempt Gemini Generation
	if s.aiService != nil && !s.aiService.IsMockMode() {
		tagList := strings.Join(cleanTags, ", ")
		randomSalt := time.Now().UnixNano() % 10000

		systemPrompt := "You are an authentic customer review generator for Google Maps. You write genuine, realistic 5-star reviews from real diners. Write naturally without corporate buzzwords, excessive exclamation marks, or overused cliches."
		userPrompt := fmt.Sprintf(
			`Write 3 realistic, authentic Google Maps customer reviews for:
Restaurant: %s
Cuisine: %s
Signature Dishes: %s
Customer's Selected Highlights: %s
Rating: %d Stars
Language: %s
Variation Seed: %d

CRITICAL RULES:
1. FULL COVERAGE OF ALL HIGHLIGHTS: You MUST incorporate and praise ALL of the customer's selected highlights (%s). If the customer selected multiple highlights (e.g., food, drinks, ambience, staff, service, hygiene, value), weave EVERY SINGLE ONE of those highlights into the review. Do NOT leave out any of them.
2. NO UNSELECTED TOPICS: DO NOT mention any aspects that were NOT selected in the highlights.
3. SCALED LENGTH: When multiple highlights (3 or more) are selected, write a thorough, detailed 3-5 sentence review so every single selected aspect receives authentic praise.
4. AVOID CLICHES: Never start with "Absolute hidden gem", "Hands down", "Blown away", or "Run don't walk". Sound like an actual customer who ate there today.
5. Provide 3 distinct styles:
   - Option 1 (Full Dining Journey): Weaves all selected highlights into a seamless, passionate dining narrative.
   - Option 2 (Detailed Breakdown): Walks through each selected highlight (food/drinks, atmosphere/cozy vibe, service/staff, cleanliness/value) with thoughtful, specific praise.
   - Option 3 (Warm Recommendation): Emphasizes how rare it is to find a place that excels across every single selected aspect, recommending it enthusiastically.

Return a valid JSON object with key "suggestions" containing an array of exactly 3 review strings.
Return ONLY valid JSON without markdown code fences.`,
			req.RestaurantName, req.Cuisine, strings.Join(req.SignatureDishes, ", "),
			tagList, req.Rating, req.Language, randomSalt, tagList,
		)

		raw, _, err := s.aiService.CallGemini(ctx, systemPrompt, userPrompt)
		if err == nil {
			var parsed struct {
				Suggestions []string `json:"suggestions"`
			}
			if err := json.Unmarshal([]byte(raw), &parsed); err == nil && len(parsed.Suggestions) > 0 {
				return &domainreview.GenerateReviewResponse{
					Suggestions:          parsed.Suggestions,
					GooglePlaceReviewURL: googlePlaceURL,
				}, nil
			}
		}
	}

	// Deterministic mock fallback
	return &domainreview.GenerateReviewResponse{
		Suggestions:          mockReviewSuggestions(req),
		GooglePlaceReviewURL: googlePlaceURL,
	}, nil
}

// SubmitPrivateFeedback records 1-5 star feedback internally and dispatches immediate WhatsApp notification to managers for complaints.
func (s *Service) SubmitPrivateFeedback(ctx context.Context, feedback *domainreview.PrivateFeedback) error {
	feedback.ID = bson.NewObjectID()
	feedback.CreatedAt = time.Now().UTC()
	feedback.UpdatedAt = feedback.CreatedAt

	if feedback.Rating >= 4 {
		if feedback.Status == "" {
			feedback.Status = "positive"
		}
	} else {
		if feedback.Status == "" {
			feedback.Status = "new"
		}
	}

	if s.db != nil {
		coll := s.db.Collection("reviews_feedback")
		if _, err := coll.InsertOne(ctx, feedback); err != nil {
			return err
		}

		// Track metrics in reviews_stats
		statsColl := s.db.Collection("reviews_stats")
		if feedback.Rating >= 4 {
			_, _ = statsColl.UpdateOne(ctx,
				bson.M{"tenantId": feedback.TenantID},
				bson.M{
					"$inc":         bson.M{"positiveGenerated": 1},
					"$setOnInsert": bson.M{"totalScans": 1, "negativeShielded": 0, "createdAt": time.Now().UTC()},
					"$set":         bson.M{"updatedAt": time.Now().UTC()},
				},
				options.UpdateOne().SetUpsert(true),
			)
		} else {
			_, _ = statsColl.UpdateOne(ctx,
				bson.M{"tenantId": feedback.TenantID},
				bson.M{
					"$inc":         bson.M{"negativeShielded": 1},
					"$setOnInsert": bson.M{"totalScans": 1, "positiveGenerated": 0, "createdAt": time.Now().UTC()},
					"$set":         bson.M{"updatedAt": time.Now().UTC()},
				},
				options.UpdateOne().SetUpsert(true),
			)
		}
	}

	// Only alert manager for negative / shielded complaints (1-3 stars)
	if feedback.Rating <= 3 {
		// Lookup restaurant name for notification
		restaurantName := "Your Restaurant"
		if s.db != nil {
			var t domaintenant.Tenant
			if err := s.db.Collection("tenants").FindOne(ctx, bson.M{"_id": feedback.TenantID}).Decode(&t); err == nil {
				restaurantName = t.Name
			}
		}

		// Alert manager via WhatsApp
		if s.waService != nil {
			s.waService.NotifyAdminNegativeFeedback(
				ctx,
				feedback.TenantID,
				feedback.Rating,
				feedback.IssueCategories,
				feedback.Comment,
				feedback.GuestPhone,
				restaurantName,
			)
		}

		// Alert manager via In-App Notification Hub
		if s.notifService != nil {
			s.notifService.NotifyNegativeFeedbackReceived(
				ctx,
				feedback.TenantID,
				feedback.Rating,
				feedback.Comment,
				feedback.GuestPhone,
			)
		}
	}

	return nil
}

// GetReviewStats computes scans, shielded complaints, positive drafts, and conversion rate dynamically.
func (s *Service) GetReviewStats(ctx context.Context, tenantID bson.ObjectID) (*domainreview.ReviewStats, error) {
	if s.db == nil {
		return &domainreview.ReviewStats{
			TotalScans:        142,
			PositiveGenerated: 118,
			NegativeShielded:  8,
			AverageSentiment:  4.8,
			TotalReviews:      126,
			FiveStarCount:     102,
			FourStarCount:     16,
			ThreeStarCount:    4,
			TwoStarCount:      3,
			OneStarCount:      1,
			ConversionRate:    83.1,
		}, nil
	}

	statsColl := s.db.Collection("reviews_stats")
	var doc struct {
		TotalScans        int64 `bson:"totalScans"`
		PositiveGenerated int64 `bson:"positiveGenerated"`
		NegativeShielded  int64 `bson:"negativeShielded"`
	}

	_ = statsColl.FindOne(ctx, bson.M{"tenantId": tenantID}).Decode(&doc)

	// Fetch all feedback documents for this tenant to compute live dynamic aggregates
	feedbackColl := s.db.Collection("reviews_feedback")
	cursor, err := feedbackColl.Find(ctx, bson.M{"tenantId": tenantID})
	var reviews []domainreview.PrivateFeedback
	if err == nil {
		_ = cursor.All(ctx, &reviews)
	}

	var (
		totalReviews   int64
		sumRatings     int64
		fiveStarCount  int64
		fourStarCount  int64
		threeStarCount int64
		twoStarCount   int64
		oneStarCount   int64
		positiveCount  int64
		negativeCount  int64
	)

	for _, r := range reviews {
		totalReviews++
		sumRatings += int64(r.Rating)
		switch r.Rating {
		case 5:
			fiveStarCount++
			positiveCount++
		case 4:
			fourStarCount++
			positiveCount++
		case 3:
			threeStarCount++
			negativeCount++
		case 2:
			twoStarCount++
			negativeCount++
		case 1:
			oneStarCount++
			negativeCount++
		default:
			if r.Rating >= 4 {
				positiveCount++
			} else if r.Rating > 0 {
				negativeCount++
			}
		}
	}

	// Sync counts with stats document
	if positiveCount > doc.PositiveGenerated {
		doc.PositiveGenerated = positiveCount
	}
	if negativeCount > doc.NegativeShielded {
		doc.NegativeShielded = negativeCount
	}

	totalInteractions := doc.PositiveGenerated + doc.NegativeShielded
	if doc.TotalScans < totalInteractions {
		doc.TotalScans = totalInteractions
	}

	var averageSentiment float64 = 5.0
	if totalReviews > 0 {
		averageSentiment = math.Round((float64(sumRatings)/float64(totalReviews))*10) / 10
	}

	var conversionRate float64
	if doc.TotalScans > 0 {
		conversionRate = math.Round((float64(doc.PositiveGenerated)/float64(doc.TotalScans))*1000) / 10
	}

	return &domainreview.ReviewStats{
		TotalScans:        doc.TotalScans,
		PositiveGenerated: doc.PositiveGenerated,
		NegativeShielded:  doc.NegativeShielded,
		AverageSentiment:  averageSentiment,
		TotalReviews:      totalReviews,
		FiveStarCount:     fiveStarCount,
		FourStarCount:     fourStarCount,
		ThreeStarCount:    threeStarCount,
		TwoStarCount:      twoStarCount,
		OneStarCount:      oneStarCount,
		ConversionRate:    conversionRate,
	}, nil
}

// RecordScan increments the total QR scan counter for a restaurant by slug.
func (s *Service) RecordScan(ctx context.Context, slug string) (int64, error) {
	if s.db == nil {
		return 1, nil
	}

	var t domaintenant.Tenant
	err := s.db.Collection("tenants").FindOne(ctx, bson.M{
		"slug":      slug,
		"deletedAt": bson.M{"$exists": false},
	}).Decode(&t)
	if err != nil {
		return 0, errors.New("restaurant not found")
	}

	statsColl := s.db.Collection("reviews_stats")
	res := statsColl.FindOneAndUpdate(
		ctx,
		bson.M{"tenantId": t.ID},
		bson.M{
			"$inc":         bson.M{"totalScans": 1},
			"$setOnInsert": bson.M{"positiveGenerated": 0, "negativeShielded": 0, "createdAt": time.Now().UTC()},
			"$set":         bson.M{"updatedAt": time.Now().UTC()},
		},
		options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After),
	)

	var updated struct {
		TotalScans int64 `bson:"totalScans"`
	}
	if err := res.Decode(&updated); err == nil {
		return updated.TotalScans, nil
	}

	return 1, nil
}

// ListPrivateFeedback returns tenant-isolated feedback logs.
func (s *Service) ListPrivateFeedback(ctx context.Context, tenantID bson.ObjectID, page, limit int, status string) ([]domainreview.PrivateFeedback, int64, error) {
	if s.db == nil {
		return []domainreview.PrivateFeedback{}, 0, nil
	}

	coll := s.db.Collection("reviews_feedback")
	scope := mongoinfra.NewScope(coll, tenantID)

	filter := bson.M{}
	if status != "" {
		if status == "negative" {
			filter["rating"] = bson.M{"$lte": 3}
		} else if status == "positive" {
			filter["rating"] = bson.M{"$gte": 4}
		} else {
			filter["status"] = status
		}
	}

	total, err := scope.Count(ctx, filter)
	if err != nil {
		return nil, 0, err
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetSkip(int64((page - 1) * limit)).
		SetLimit(int64(limit))

	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, 0, err
	}
	defer cursor.Close(ctx)

	var list []domainreview.PrivateFeedback
	if err := cursor.All(ctx, &list); err != nil {
		return nil, 0, err
	}
	if list == nil {
		list = []domainreview.PrivateFeedback{}
	}

	return list, total, nil
}

// UpdateFeedbackStatus updates the resolution status of private feedback.
func (s *Service) UpdateFeedbackStatus(ctx context.Context, tenantID, feedbackID bson.ObjectID, status, notes string) error {
	if s.db == nil {
		return nil
	}

	coll := s.db.Collection("reviews_feedback")
	filter := bson.M{"_id": feedbackID, "tenantId": tenantID}
	updateSet := bson.M{"status": status, "updatedAt": time.Now().UTC()}
	if notes != "" {
		updateSet["resolutionNotes"] = notes
	}
	update := bson.M{"$set": updateSet}

	_, err := coll.UpdateOne(ctx, filter, update)
	return err
}

func cleanReviewTag(tag string) string {
	var sb strings.Builder
	for _, r := range tag {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == ' ' {
			sb.WriteRune(r)
		}
	}
	return strings.TrimSpace(sb.String())
}

func mockReviewSuggestions(req domainreview.GenerateReviewRequest) []string {
	name := req.RestaurantName
	if name == "" {
		name = "this restaurant"
	}
	dishStr := ""
	if len(req.SignatureDishes) > 0 {
		dishStr = req.SignatureDishes[0]
	}

	var hasFood, hasAmbience, hasService, hasStaff, hasValue, hasDrinks, hasHygiene, hasCozy bool
	for _, t := range req.Tags {
		lower := strings.ToLower(t)
		if strings.Contains(lower, "food") || strings.Contains(lower, "taste") || strings.Contains(lower, "delicious") {
			hasFood = true
		}
		if strings.Contains(lower, "ambience") || strings.Contains(lower, "atmosphere") {
			hasAmbience = true
		}
		if strings.Contains(lower, "service") || strings.Contains(lower, "fast") || strings.Contains(lower, "quick") {
			hasService = true
		}
		if strings.Contains(lower, "staff") || strings.Contains(lower, "friendly") || strings.Contains(lower, "hospitality") {
			hasStaff = true
		}
		if strings.Contains(lower, "value") || strings.Contains(lower, "price") || strings.Contains(lower, "money") {
			hasValue = true
		}
		if strings.Contains(lower, "drink") || strings.Contains(lower, "beverage") || strings.Contains(lower, "cocktail") || strings.Contains(lower, "mocktail") {
			hasDrinks = true
		}
		if strings.Contains(lower, "hygiene") || strings.Contains(lower, "clean") || strings.Contains(lower, "spotless") {
			hasHygiene = true
		}
		if strings.Contains(lower, "cozy") || strings.Contains(lower, "comfort") || strings.Contains(lower, "vibe") {
			hasCozy = true
		}
	}

	// Default fallback if no specific tags matched
	hasAny := hasFood || hasAmbience || hasService || hasStaff || hasValue || hasDrinks || hasHygiene || hasCozy
	if !hasAny {
		return []string{
			fmt.Sprintf("Had an outstanding dining experience at %s! Everything exceeded expectations. Definitely coming back soon with family and friends!", name),
			fmt.Sprintf("10/10 dining at %s! Great quality, attentive care, and welcoming energy throughout. Highly recommended!", name),
			fmt.Sprintf("From the moment we walked into %s, the experience was memorable. A true gem that nails consistency and quality!", name),
		}
	}

	if strings.ToLower(req.Language) == "hi" {
		var hiParts []string
		if hasFood {
			hiParts = append(hiParts, "खाना बेहद स्वादिष्ट और ताज़ा था")
		}
		if hasDrinks {
			hiParts = append(hiParts, "ड्रिंक्स भी लाजवाब थीं")
		}
		if hasAmbience || hasCozy {
			hiParts = append(hiParts, "यहाँ का माहौल और इंटीरियर बहुत ही खूबसूरत और सुकून देने वाला है")
		}
		if hasService {
			hiParts = append(hiParts, "सर्विस बहुत ही तेज़ थी")
		}
		if hasStaff {
			hiParts = append(hiParts, "स्टाफ का व्यवहार बहुत ही विनम्र और मददगार था")
		}
		if hasHygiene {
			hiParts = append(hiParts, "सफाई और हाइजीन का पूरा ध्यान रखा गया है")
		}
		if hasValue {
			hiParts = append(hiParts, "पैसे की पूरी कद्र है")
		}
		summary := strings.Join(hiParts, ", ")
		return []string{
			fmt.Sprintf("%s में बहुत ही शानदार अनुभव रहा! %s। 5 स्टार रेटिंग!", name, summary),
			fmt.Sprintf("%s का अनुभव लाजवाब रहा। %s। हम यहाँ फिर ज़रूर आएँगे!", name, summary),
			fmt.Sprintf("अगर आप बेहतरीन जगह ढूँढ रहे हैं तो %s एकदम सही है। %s। सभी को यहाँ आने की सलाह दूँगा!", name, summary),
		}
	}

	// --- Option 1: Complete Experience (Foodie & Passionate) ---
	var s1Sentences []string

	if hasFood && hasDrinks {
		if dishStr != "" {
			s1Sentences = append(s1Sentences, fmt.Sprintf("The food was prepared to absolute perfection—especially the %s—and the signature drinks were creative and refreshing.", dishStr))
		} else {
			s1Sentences = append(s1Sentences, "The food was prepared to absolute perfection with incredible flavors, and the signature drinks were creative and refreshing.")
		}
	} else if hasFood {
		if dishStr != "" {
			s1Sentences = append(s1Sentences, fmt.Sprintf("The food was prepared to absolute perfection, especially the %s which was bursting with authentic flavors.", dishStr))
		} else {
			s1Sentences = append(s1Sentences, "The food was prepared to absolute perfection, with rich, authentic flavors in every single dish.")
		}
	} else if hasDrinks {
		s1Sentences = append(s1Sentences, "The signature drinks were expertly crafted, refreshing, and full of flavor.")
	}

	if hasAmbience && hasCozy {
		s1Sentences = append(s1Sentences, "The ambience is gorgeous with warm, cozy lighting that creates an intimate, relaxing vibe.")
	} else if hasAmbience {
		s1Sentences = append(s1Sentences, "The aesthetic decor and ambient music create a wonderfully stylish dining atmosphere.")
	} else if hasCozy {
		s1Sentences = append(s1Sentences, "The seating is wonderfully comfortable and the cozy vibe makes you want to linger.")
	}

	if hasService && hasStaff {
		s1Sentences = append(s1Sentences, "Service was remarkably fast and efficient, and the staff treated us with genuine warmth and attentiveness.")
	} else if hasService {
		s1Sentences = append(s1Sentences, "Service was remarkably fast and efficient without feeling rushed.")
	} else if hasStaff {
		s1Sentences = append(s1Sentences, "The team greeted us with genuine smiles and provided thoughtful, attentive hospitality.")
	}

	if hasHygiene && hasValue {
		s1Sentences = append(s1Sentences, "On top of that, the entire venue was spotlessly clean, and the generous portions offer fantastic value for money.")
	} else if hasHygiene {
		s1Sentences = append(s1Sentences, "We were especially impressed by the spotless hygiene and how clean and tidy everything was kept.")
	} else if hasValue {
		s1Sentences = append(s1Sentences, "The generous portion sizes and reasonable pricing offer fantastic value for money.")
	}

	opt1 := fmt.Sprintf("Outstanding visit to %s! %s Highly recommended to anyone looking for a top-tier dining experience!", name, strings.Join(s1Sentences, " "))

	// --- Option 2: Detailed Breakdown (Crisp & High Impact) ---
	var s2Points []string
	if hasFood {
		if dishStr != "" {
			s2Points = append(s2Points, fmt.Sprintf("The %s and every course we tried was packed with flavor and cooked with evident culinary skill.", dishStr))
		} else {
			s2Points = append(s2Points, "Every course was packed with flavor and cooked with evident culinary skill.")
		}
	}
	if hasDrinks {
		s2Points = append(s2Points, "Their craft beverages are top-notch and pair wonderfully with the meal.")
	}
	if hasAmbience || hasCozy {
		s2Points = append(s2Points, "The atmosphere is stylish, beautifully lit, and exceptionally inviting.")
	}
	if hasService {
		s2Points = append(s2Points, "Turnaround from kitchen to table was impressively quick.")
	}
	if hasStaff {
		s2Points = append(s2Points, "The staff was courteous, polite, and on top of every detail.")
	}
	if hasHygiene {
		s2Points = append(s2Points, "Strict hygiene standards are obvious—the space is immaculate from corner to corner.")
	}
	if hasValue {
		s2Points = append(s2Points, "Portions are generous and pricing is very fair for the quality.")
	}

	opt2 := fmt.Sprintf("10/10 across the board at %s! %s Easily one of the best dining decisions we've made recently.", name, strings.Join(s2Points, " "))

	// --- Option 3: Warm Recommendation (Memorable & Heartfelt) ---
	var activeHighlights []string
	if hasFood {
		activeHighlights = append(activeHighlights, "mouthwatering food")
	}
	if hasDrinks {
		activeHighlights = append(activeHighlights, "crafted drinks")
	}
	if hasAmbience || hasCozy {
		activeHighlights = append(activeHighlights, "captivating atmosphere")
	}
	if hasStaff {
		activeHighlights = append(activeHighlights, "heartfelt hospitality")
	}
	if hasService {
		activeHighlights = append(activeHighlights, "swift service")
	}
	if hasHygiene {
		activeHighlights = append(activeHighlights, "spotless hygiene")
	}
	if hasValue {
		activeHighlights = append(activeHighlights, "unbeatable value")
	}

	var highlightPhrase string
	if len(activeHighlights) > 1 {
		highlightPhrase = strings.Join(activeHighlights[:len(activeHighlights)-1], ", ") + " and " + activeHighlights[len(activeHighlights)-1]
	} else if len(activeHighlights) == 1 {
		highlightPhrase = activeHighlights[0]
	} else {
		highlightPhrase = "great dining"
	}

	var s3Sentences []string
	s3Sentences = append(s3Sentences, fmt.Sprintf("It is rare to find a place like %s that checks every single box, delivering %s.", name, highlightPhrase))

	if hasFood && (hasAmbience || hasCozy) {
		s3Sentences = append(s3Sentences, "The combination of exceptional culinary flavors and an unhurried, comfortable setting made our gathering truly special.")
	} else if hasFood {
		s3Sentences = append(s3Sentences, "The depth of flavor in every dish left a lasting impression on our entire table.")
	} else if hasAmbience || hasCozy {
		s3Sentences = append(s3Sentences, "The relaxed, inviting setting provides the ideal backdrop for a memorable evening.")
	}

	if hasStaff && hasService {
		s3Sentences = append(s3Sentences, "The team's dedication to fast service and gracious care made us feel genuinely valued.")
	} else if hasStaff {
		s3Sentences = append(s3Sentences, "A big shoutout to the staff for making us feel so welcomed and looked after.")
	} else if hasService {
		s3Sentences = append(s3Sentences, "Service was prompt and flawless from the moment we sat down.")
	}

	if hasHygiene || hasValue {
		s3Sentences = append(s3Sentences, "You can dine with complete confidence knowing the place is pristine and the pricing is completely fair.")
	}

	opt3 := fmt.Sprintf("%s We will definitely be regular diners here and can't recommend it enough!", strings.Join(s3Sentences, " "))

	return []string{opt1, opt2, opt3}
}
