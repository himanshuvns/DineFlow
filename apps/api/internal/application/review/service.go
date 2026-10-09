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
1. FOCUS STRICTLY on the customer's selected highlights (%s).
2. DO NOT mention or praise unselected aspects (e.g. if the customer only highlighted food and ambience, DO NOT praise speed of service, staff friendliness, hygiene, drinks, or prices).
3. AVOID CLICHES: Never start with "Absolute hidden gem", "Hands down", "Blown away", or "Run don't walk". Sound like an actual customer who ate there today.
4. Each option must have a distinct realistic diner personality:
   - Option 1 (Punchy & Direct): 1-2 crisp, high-impact sentences focusing directly on the selected highlights.
   - Option 2 (Detailed Experience): 2-3 natural sentences highlighting the specific sensory flavors or setting selected.
   - Option 3 (Warm Recommendation): 2-3 genuine sentences recommending the spot to other diners based purely on what they loved.

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
		if strings.Contains(lower, "ambience") || strings.Contains(lower, "atmosphere") || strings.Contains(lower, "vibe") {
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
		if strings.Contains(lower, "cozy") || strings.Contains(lower, "comfort") {
			hasCozy = true
		}
	}

	// Default fallback if no specific tags matched
	if !hasFood && !hasAmbience && !hasService && !hasStaff && !hasValue && !hasDrinks && !hasHygiene && !hasCozy {
		hasFood = true
		hasAmbience = true
	}

	if strings.ToLower(req.Language) == "hi" {
		if hasFood && hasAmbience {
			return []string{
				fmt.Sprintf("%s का खाना और माहौल दोनों लाजवाब हैं! बहुत ही शानदार अनुभव रहा।", name),
				fmt.Sprintf("यहाँ का खाना बहुत ही स्वादिष्ट है और इंटीरियर व डेकोरेशन बहुत खूबसूरत है। 5 स्टार!"),
				fmt.Sprintf("अगर आप बेहतरीन स्वाद और अच्छे माहौल की तलाश में हैं, तो %s एकदम सही जगह है।", name),
			}
		}
		if hasFood {
			return []string{
				fmt.Sprintf("%s का खाना बहुत ही स्वादिष्ट और ताज़ा था! हर निवाले में बेहतरीन स्वाद था।", name),
				fmt.Sprintf("यहाँ के व्यंजनों का स्वाद बहुत ही लाजवाब है। 10/10 रेटिंग!"),
				fmt.Sprintf("शानदार खाना और उम्दा क्वालिटी। %s फिर ज़रूर आएँगे!", name),
			}
		}
		return []string{
			fmt.Sprintf("%s में बहुत बढ़िया अनुभव रहा। 5 स्टार सर्विस और बेहतरीन अनुभव!", name),
			fmt.Sprintf("यहाँ आकर बहुत अच्छा लगा। बहुत ही सुकून देने वाली जगह।"),
			fmt.Sprintf("सभी को %s आने की सलाह दूँगा। बहुत ही अच्छा अनुभव रहा!", name),
		}
	}

	// Dynamic synthesis strictly based on active categories
	var opt1, opt2, opt3 string

	// Option 1: Punchy & Direct
	switch {
	case hasFood && hasAmbience:
		opt1 = fmt.Sprintf("Great experience at %s! The food was packed with incredible flavor and the ambience made for a wonderful dining experience.", name)
	case hasFood && hasService:
		opt1 = fmt.Sprintf("Delicious food and super fast turnaround at %s! Our dishes arrived hot, fresh, and full of flavor.", name)
	case hasFood && hasStaff:
		opt1 = fmt.Sprintf("Top-notch food and remarkably warm hospitality at %s. You can tell the team genuinely cares about their diners.", name)
	case hasFood:
		if dishStr != "" {
			opt1 = fmt.Sprintf("Outstanding meal at %s! The %s was prepared to absolute perfection with wonderful authentic flavors.", name, dishStr)
		} else {
			opt1 = fmt.Sprintf("Outstanding meal at %s! The food was fresh, vibrant, and bursting with rich authentic flavors.", name)
		}
	case hasAmbience && hasStaff:
		opt1 = fmt.Sprintf("Wonderful atmosphere and genuine, welcoming hospitality at %s. Made our evening truly memorable!", name)
	case hasAmbience:
		opt1 = fmt.Sprintf("The ambience at %s is exceptional! Beautiful lighting, great mood, and an effortlessly stylish setting.", name)
	case hasService && hasStaff:
		opt1 = fmt.Sprintf("Incredible service at %s! Staff was polite and attentive, and our orders arrived without any waiting.", name)
	case hasService:
		opt1 = fmt.Sprintf("Remarkably prompt and efficient service at %s. Fast turnaround without compromising on quality!", name)
	case hasStaff:
		opt1 = fmt.Sprintf("The staff at %s was so courteous and attentive throughout our visit. Truly heartwarming hospitality!", name)
	case hasDrinks:
		opt1 = fmt.Sprintf("Fantastic beverages at %s! The signature drinks were refreshing, creative, and expertly crafted.", name)
	case hasHygiene:
		opt1 = fmt.Sprintf("Impressed by how clean and spotless %s is. Impeccable hygiene standards and a very tidy dining area.", name)
	case hasValue:
		opt1 = fmt.Sprintf("Generous portion sizes and great value for money at %s. You definitely get top quality for what you pay!", name)
	default:
		opt1 = fmt.Sprintf("Had a wonderful 5-star experience at %s! Definitely coming back soon.", name)
	}

	// Option 2: Detailed Experience
	switch {
	case hasFood && hasAmbience:
		opt2 = "Every single dish was cooked to perfection and plated beautifully. Combined with the cozy lighting and relaxed music, it was easily one of the best dinners we have had."
	case hasFood && hasHygiene:
		opt2 = "You can immediately tell how fresh the ingredients are, and the open dining room is pristine and spotless. A fantastic culinary experience."
	case hasFood && hasDrinks:
		opt2 = "The food was rich and full of flavor, and their drinks paired perfectly with the meal. Clearly a kitchen that takes craft seriously."
	case hasFood:
		opt2 = "The depth of flavor in every course was phenomenal. Seasoned to perfection and served piping hot. 10/10 for food quality and taste."
	case hasAmbience && hasCozy:
		opt2 = "Such a cozy, charming setting with great attention to interior decor. It provides the ideal backdrop for a relaxed and unhurried meal."
	case hasAmbience:
		opt2 = "The aesthetic decor and ambient music create such an inviting dining atmosphere. A really chic and comfortable place to spend an evening."
	case hasStaff && hasService:
		opt2 = "From the greeting at the door to the swift delivery of our orders, the team handled everything with utmost professionalism and care."
	case hasStaff:
		opt2 = "Staff members were polite, knowledgeable about the menu, and always ready to help with a smile. First-class customer service."
	case hasValue:
		opt2 = "High quality ingredients combined with very reasonable pricing. Portion sizes are hearty and well worth every penny."
	case hasHygiene:
		opt2 = "The tables, cutlery, and entire venue are maintained to high cleanliness standards. Felt comfortable and well looked after."
	default:
		opt2 = "Everything during our visit exceeded expectations. High quality standards and a very pleasant experience overall."
	}

	// Option 3: Warm Recommendation
	switch {
	case hasFood && hasAmbience:
		opt3 = fmt.Sprintf("If you appreciate exceptional food in a gorgeous, relaxing atmosphere, %s is an absolute must-visit. Highly recommended!", name)
	case hasFood && hasStaff:
		opt3 = fmt.Sprintf("Delicious food coupled with staff that treats you like family. Will definitely be recommending %s to friends and colleagues!", name)
	case hasFood && hasValue:
		opt3 = fmt.Sprintf("Top-tier flavors without breaking the bank. %s is our new favorite spot for great food and great value!", name)
	case hasFood:
		opt3 = fmt.Sprintf("A true delight for anyone who loves great food. We will definitely be returning to %s to try more of the menu!", name)
	case hasAmbience:
		opt3 = fmt.Sprintf("Can't recommend %s enough for anyone wanting a lovely setting for dates or gatherings. The vibe is simply unmatched!", name)
	case hasStaff:
		opt3 = fmt.Sprintf("A big shoutout to the wonderful team at %s for making us feel so valued. Exceptional hospitality all around!", name)
	case hasService:
		opt3 = fmt.Sprintf("Rare to find a place that respects your time with such fast and organized service. Keep up the fantastic work, %s!", name)
	default:
		opt3 = fmt.Sprintf("5 stars all the way for %s! Looking forward to our next visit.", name)
	}

	return []string{opt1, opt2, opt3}
}
