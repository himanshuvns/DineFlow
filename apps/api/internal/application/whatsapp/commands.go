package whatsapp

import (
	"context"
	"fmt"
	"strings"
	"time"

	domainorder "github.com/dineflow/api/internal/domain/order"
	domainwa "github.com/dineflow/api/internal/domain/whatsapp"
	"github.com/dineflow/api/internal/messaging"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// ProcessRuleBasedCommand handles incoming user commands (Hi, Menu, Order Status) deterministically.
func (s *Service) ProcessRuleBasedCommand(ctx context.Context, tenantID bson.ObjectID, fromPhone, text string) (string, bool) {
	clean := strings.ToLower(strings.TrimSpace(text))
	cleanPhone := messaging.CleanPhoneNumber(fromPhone)

	switch {
	case clean == "hi" || clean == "hello" || clean == "hey" || clean == "start":
		reply := "👋 *Welcome to DineFlow!*\n\n" +
			"How can we assist you today? Reply with:\n" +
			"• *Menu* — View our digital menu & chef specials\n" +
			"• *Order Status* — Check the live status of your order\n" +
			"• *Help* — Request assistance from our dining steward"
		return reply, true

	case clean == "menu":
		// Get tenant slug if available
		menuURL := "https://dineflow-steel.vercel.app/m/the-grand-bistro"
		if s.db != nil {
			var t struct {
				Slug string `bson:"slug"`
				Name string `bson:"name"`
			}
			if err := s.db.Collection("tenants").FindOne(ctx, bson.M{"_id": tenantID}).Decode(&t); err == nil && t.Slug != "" {
				menuURL = fmt.Sprintf("https://dineflow-steel.vercel.app/m/%s", t.Slug)
			}
		}

		reply := fmt.Sprintf("🍽️ *DineFlow Digital Menu*\n\n"+
			"Browse courses, customize items, and place orders directly from your phone:\n"+
			"👉 %s\n\n"+
			"Enjoy your culinary experience!", menuURL)
		return reply, true

	case clean == "order status" || clean == "order" || clean == "status" || clean == "track":
		if s.db == nil {
			return "Your order is confirmed and being freshly prepared in the kitchen.", true
		}

		// Look up latest order for this phone number
		coll := s.db.Collection("orders")
		filter := bson.M{
			"$or": []bson.M{
				{"customerPhone": fromPhone},
				{"customerPhone": cleanPhone},
				{"customerPhone": "+" + cleanPhone},
				{"customerPhone": strings.TrimPrefix(cleanPhone, "91")},
			},
		}
		if !tenantID.IsZero() {
			filter["tenantId"] = tenantID
		}

		opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		var ord domainorder.Order
		err := coll.FindOne(ctx, filter, opts).Decode(&ord)

		if err != nil || ord.ID.IsZero() {
			return "We could not locate an active order for your phone number. Reply *Menu* to explore our dishes and order!", true
		}

		loc := ord.TableName
		if loc == "" {
			loc = "Dining Table"
		}
		if ord.RoomNumber != "" {
			loc = fmt.Sprintf("Suite %s", ord.RoomNumber)
		}

		statusStr := strings.ToUpper(string(ord.Status))
		trackingURL := fmt.Sprintf("https://dineflow-steel.vercel.app/m/the-grand-bistro/order/%s", ord.OrderNumber)

		reply := fmt.Sprintf("📋 *Order Details: %s*\n\n"+
			"• Status: *%s*\n"+
			"• Location: %s\n"+
			"• Courses: %d item(s)\n"+
			"• Total: ₹%.0f\n\n"+
			"📍 Live Kitchen Tracker: %s\n\n"+
			"Reply *Menu* to add more items.",
			ord.OrderNumber, statusStr, loc, len(ord.Items), ord.TotalAmount, trackingURL)
		return reply, true

	case clean == "help" || clean == "support" || clean == "steward":
		return "🛎️ A member of our floor team has been notified. You may also speak directly to any server at your table or call the front desk.", true

	case domainwa.IsOptOutKeyword(text):
		s.RecordOptOut(fromPhone)
		return "You have been unsubscribed from DineFlow WhatsApp updates. Reply *START* anytime to resubscribe.", true
	}

	return "", false
}

// LogWebhookEvent saves development webhook audit logs to MongoDB.
func (s *Service) LogWebhookEvent(ctx context.Context, tenantID bson.ObjectID, eventType string, payload map[string]interface{}) {
	if s.db == nil {
		return
	}
	coll := s.db.Collection("whatsapp_webhooks")
	doc := bson.M{
		"tenantId":  tenantID,
		"eventType": eventType,
		"payload":   payload,
		"createdAt": time.Now().UTC(),
	}
	_, _ = coll.InsertOne(ctx, doc)
}
