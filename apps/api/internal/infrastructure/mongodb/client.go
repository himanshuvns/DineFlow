package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.uber.org/zap"
)

const (
	connectTimeout = 10 * time.Second
	pingTimeout    = 5 * time.Second
)

// Client wraps the mongo.Client and provides the DineFlow database.
type Client struct {
	client *mongo.Client
	db     *mongo.Database
	log    *zap.Logger
}

// New connects to MongoDB Atlas with the given URI and returns a Client.
// It verifies connectivity with a ping before returning.
func New(ctx context.Context, uri, dbName string, log *zap.Logger) (*Client, error) {
	connectCtx, cancel := context.WithTimeout(ctx, connectTimeout)
	defer cancel()

	opts := options.Client().
		ApplyURI(uri).
		SetConnectTimeout(connectTimeout).
		SetServerSelectionTimeout(connectTimeout)

	client, err := mongo.Connect(opts)
	if err != nil {
		return nil, fmt.Errorf("mongodb: connect: %w", err)
	}

	// Verify connectivity
	pingCtx, pingCancel := context.WithTimeout(connectCtx, pingTimeout)
	defer pingCancel()

	if err := client.Ping(pingCtx, nil); err != nil {
		return nil, fmt.Errorf("mongodb: ping: %w", err)
	}

	log.Info("MongoDB connected", zap.String("database", dbName))

	return &Client{
		client: client,
		db:     client.Database(dbName),
		log:    log,
	}, nil
}

// DB returns the underlying mongo.Database.
func (c *Client) DB() *mongo.Database {
	return c.db
}

// Collection returns a named collection from the DineFlow database.
func (c *Client) Collection(name string) *mongo.Collection {
	return c.db.Collection(name)
}

// Ping verifies the connection is still alive.
func (c *Client) Ping(ctx context.Context) error {
	pingCtx, cancel := context.WithTimeout(ctx, pingTimeout)
	defer cancel()
	return c.client.Ping(pingCtx, nil)
}

// Disconnect gracefully closes all connections.
func (c *Client) Disconnect(ctx context.Context) error {
	c.log.Info("MongoDB disconnecting...")
	return c.client.Disconnect(ctx)
}

// ─── Index Setup ──────────────────────────────────────────────────────────────

// EnsureIndexes creates all required indexes for the DineFlow collections.
// Safe to call on every startup — MongoDB is idempotent for existing indexes.
func (c *Client) EnsureIndexes(ctx context.Context) error {
	indexDefs := map[string][]mongo.IndexModel{
		"tenants": {
			{Keys: bson.D{{Key: "slug", Value: 1}}, Options: options.Index().SetUnique(true).SetName("idx_slug")},
			{Keys: bson.D{{Key: "contact.email", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true).SetName("idx_email")},
			{Keys: bson.D{{Key: "plan", Value: 1}, {Key: "status", Value: 1}}, Options: options.Index().SetName("idx_plan_status")},
		},
		"users": {
			{Keys: bson.D{{Key: "phone", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true).SetName("idx_user_phone")},
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "email", Value: 1}}, Options: options.Index().SetUnique(true).SetSparse(true).SetName("idx_tenant_email")},
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "role", Value: 1}}, Options: options.Index().SetName("idx_tenant_role")},
			{Keys: bson.D{{Key: "auth.refreshTokens.tokenId", Value: 1}}, Options: options.Index().SetSparse(true).SetName("idx_refresh_token_id")},
			{Keys: bson.D{{Key: "inviteToken", Value: 1}}, Options: options.Index().SetSparse(true).SetName("idx_invite_token")},
		},
		"subscriptions": {
			{Keys: bson.D{{Key: "tenantId", Value: 1}}, Options: options.Index().SetUnique(true).SetName("idx_tenant")},
			{Keys: bson.D{{Key: "status", Value: 1}, {Key: "currentPeriodEnd", Value: 1}}, Options: options.Index().SetName("idx_status_period")},
			{Keys: bson.D{{Key: "providerSubscriptionId", Value: 1}}, Options: options.Index().SetSparse(true).SetName("idx_provider_sub")},
		},
		"tables": {
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "locationId", Value: 1}}, Options: options.Index().SetName("idx_tenant_location")},
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "status", Value: 1}}, Options: options.Index().SetName("idx_tenant_status")},
		},
		"qr_codes": {
			{Keys: bson.D{{Key: "shortCode", Value: 1}}, Options: options.Index().SetUnique(true).SetName("idx_short_code")},
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "tableId", Value: 1}}, Options: options.Index().SetUnique(true).SetName("idx_tenant_table")},
		},
		"menu_items": {
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "menuId", Value: 1}, {Key: "categoryId", Value: 1}}, Options: options.Index().SetName("idx_tenant_menu_cat")},
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "isAvailable", Value: 1}}, Options: options.Index().SetName("idx_tenant_available")},
		},
		"orders": {
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "status", Value: 1}, {Key: "createdAt", Value: -1}}, Options: options.Index().SetName("idx_tenant_status_date")},
			{Keys: bson.D{{Key: "tenantId", Value: 1}, {Key: "tableId", Value: 1}, {Key: "status", Value: 1}}, Options: options.Index().SetName("idx_tenant_table_status")},
			{Keys: bson.D{{Key: "orderNumber", Value: 1}}, Options: options.Index().SetUnique(true).SetName("idx_order_number")},
		},
	}

	for collName, models := range indexDefs {
		coll := c.db.Collection(collName)
		_, err := coll.Indexes().CreateMany(ctx, models)
		if err != nil {
			c.log.Error("Failed to create indexes", zap.String("collection", collName), zap.Error(err))
			return fmt.Errorf("mongodb: ensure indexes for %s: %w", collName, err)
		}
		c.log.Info("Indexes ensured", zap.String("collection", collName))
	}

	return nil
}
