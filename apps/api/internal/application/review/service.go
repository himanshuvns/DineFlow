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

	// Attempt Gemini Generation
	if s.aiService != nil && !s.aiService.IsMockMode() {
		systemPrompt := "You are a customer review generator for restaurants. You generate authentic, diverse, and natural 5-star Google Maps reviews from a happy diner's perspective. Avoid generic corporate buzzwords."
		userPrompt := fmt.Sprintf(
			`Generate 3 distinct, authentic Google Maps customer reviews for:
Restaurant: %s
Cuisine: %s
Signature Dishes: %s
Positive Highlights: %s
Rating: %d Stars
Language: %s

Requirements:
- Option 1: Short & punchy (1-2 sentences).
- Option 2: Dish-focused, raving about flavor and presentation (2-3 sentences).
- Option 3: Hospitality & ambience focused (2-3 sentences).

Return a valid JSON object with key "suggestions" containing an array of exactly 3 review strings.
Return ONLY valid JSON without markdown code fences.`,
			req.RestaurantName, req.Cuisine, strings.Join(req.SignatureDishes, ", "),
			strings.Join(req.Tags, ", "), req.Rating, req.Language,
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

// SubmitPrivateFeedback records 1-3 star feedback internally and dispatches immediate WhatsApp notification to managers.
func (s *Service) SubmitPrivateFeedback(ctx context.Context, feedback *domainreview.PrivateFeedback) error {
	feedback.ID = bson.NewObjectID()
	feedback.CreatedAt = time.Now().UTC()
	feedback.Status = "new"

	if s.db != nil {
		coll := s.db.Collection("reviews_feedback")
		if _, err := coll.InsertOne(ctx, feedback); err != nil {
			return err
		}

		// Track negative feedback shielded
		statsColl := s.db.Collection("reviews_stats")
		_, _ = statsColl.UpdateOne(ctx,
			bson.M{"tenantId": feedback.TenantID},
			bson.M{"$inc": bson.M{"negativeShielded": 1}},
			options.UpdateOne().SetUpsert(true),
		)
	}

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

	return nil
}

// GetReviewStats computes scans, shielded complaints, positive drafts, and conversion rate.
func (s *Service) GetReviewStats(ctx context.Context, tenantID bson.ObjectID) (*domainreview.ReviewStats, error) {
	if s.db == nil {
		return &domainreview.ReviewStats{
			TotalScans:        142,
			PositiveGenerated: 118,
			NegativeShielded:  8,
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

	// Cross-verify shielded count from reviews_feedback collection
	feedbackColl := s.db.Collection("reviews_feedback")
	feedbackCount, err := feedbackColl.CountDocuments(ctx, bson.M{"tenantId": tenantID})
	if err == nil && feedbackCount > doc.NegativeShielded {
		doc.NegativeShielded = feedbackCount
	}

	if doc.TotalScans < (doc.PositiveGenerated + doc.NegativeShielded) {
		doc.TotalScans = doc.PositiveGenerated + doc.NegativeShielded
	}

	var conversionRate float64
	if doc.TotalScans > 0 {
		conversionRate = math.Round((float64(doc.PositiveGenerated)/float64(doc.TotalScans))*1000) / 10
	}

	return &domainreview.ReviewStats{
		TotalScans:        doc.TotalScans,
		PositiveGenerated: doc.PositiveGenerated,
		NegativeShielded:  doc.NegativeShielded,
		ConversionRate:    conversionRate,
	}, nil
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
		filter["status"] = status
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
func (s *Service) UpdateFeedbackStatus(ctx context.Context, tenantID, feedbackID bson.ObjectID, status string) error {
	if s.db == nil {
		return nil
	}

	coll := s.db.Collection("reviews_feedback")
	filter := bson.M{"_id": feedbackID, "tenantId": tenantID}
	update := bson.M{"$set": bson.M{"status": status, "updatedAt": time.Now().UTC()}}

	_, err := coll.UpdateOne(ctx, filter, update)
	return err
}

func mockReviewSuggestions(req domainreview.GenerateReviewRequest) []string {
	dishStr := "the signature dishes"
	if len(req.SignatureDishes) > 0 {
		dishStr = strings.Join(req.SignatureDishes, " and ")
	}
	tagStr := "warm hospitality and quick service"
	if len(req.Tags) > 0 {
		tagStr = strings.Join(req.Tags, ", ")
	}

	if strings.ToLower(req.Language) == "hi" {
		return []string{
			fmt.Sprintf("%s में शानदार अनुभव रहा! खाना बहुत ही लाजवाब था और सर्विस बहुत तेज थी।", req.RestaurantName),
			fmt.Sprintf("यहाँ का %s ज़रूर ट्राई करें, इसका स्वाद बेहतरीन था। माहौल और %s दोनों बहुत अच्छे थे। 5 स्टार!", dishStr, tagStr),
			fmt.Sprintf("%s हमारी नई पसंदीदा जगह बन गई है। परिवार के साथ डिनर करने के लिए बेहतरीन जगह!", req.RestaurantName),
		}
	}

	return []string{
		fmt.Sprintf("Had a wonderful dining experience at %s! The %s was prepared to absolute perfection.", req.RestaurantName, dishStr),
		fmt.Sprintf("Top-notch hospitality and incredible food. We especially loved the %s. Staff was courteous and the order arrived quickly!", tagStr),
		fmt.Sprintf("5 stars all the way for %s! Exceptional flavours, inviting ambience, and seamless digital service. Will definitely be returning soon!", req.RestaurantName),
	}
}
