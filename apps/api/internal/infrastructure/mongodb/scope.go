package mongodb

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Scope is a helper that forces all MongoDB operations to be tenant-scoped.
// This is the primary defense against cross-tenant data leakage.
//
// Usage:
//
//	scope := mongodb.NewScope(coll, tenantID)
//	scope.FindOne(ctx, bson.M{"email": "foo@bar.com"}, &result)
//
// All filters are automatically AND-ed with {"tenantId": tenantID}.
type Scope struct {
	coll     *mongo.Collection
	tenantID bson.ObjectID
}

// NewScope creates a new tenant-scoped query helper.
func NewScope(coll *mongo.Collection, tenantID bson.ObjectID) *Scope {
	return &Scope{coll: coll, tenantID: tenantID}
}

// scopedFilter merges the given filter with the non-negotiable mandatory tenantId constraint.
// Zero Trust Guarantee: The scoped tenantId ALWAYS takes precedence and can never be overridden by input parameters.
func (s *Scope) scopedFilter(filter bson.M) bson.M {
	merged := bson.M{}
	for k, v := range filter {
		// Strip any caller attempt to tamper with tenantId
		if k != "tenantId" {
			merged[k] = v
		}
	}
	// Non-negotiable tenant isolation
	merged["tenantId"] = s.tenantID

	// Default soft-delete filter unless caller explicitly requested deleted records
	if _, hasDeletedAt := filter["deletedAt"]; !hasDeletedAt {
		merged["deletedAt"] = bson.M{"$exists": false}
	}
	return merged
}

// FindOne finds a single document matching the filter within the tenant scope.
func (s *Scope) FindOne(ctx context.Context, filter bson.M, result interface{}) error {
	return s.coll.FindOne(ctx, s.scopedFilter(filter)).Decode(result)
}

// FindByID finds a document by its ObjectID within the tenant scope.
func (s *Scope) FindByID(ctx context.Context, id bson.ObjectID, result interface{}) error {
	return s.FindOne(ctx, bson.M{"_id": id}, result)
}

// Find returns a cursor for all documents matching the filter within the tenant scope.
func (s *Scope) Find(ctx context.Context, filter bson.M, opts ...options.Lister[options.FindOptions]) (*mongo.Cursor, error) {
	return s.coll.Find(ctx, s.scopedFilter(filter), opts...)
}

// InsertOne inserts a document. The tenantId is NOT added automatically here —
// the caller must include it in the document struct.
func (s *Scope) InsertOne(ctx context.Context, doc interface{}) (*mongo.InsertOneResult, error) {
	return s.coll.InsertOne(ctx, doc)
}

// InsertMany inserts multiple documents within the tenant scope.
func (s *Scope) InsertMany(ctx context.Context, docs []interface{}) (*mongo.InsertManyResult, error) {
	return s.coll.InsertMany(ctx, docs)
}

// UpdateOne updates a single document matching the filter within the tenant scope.
func (s *Scope) UpdateOne(ctx context.Context, filter bson.M, update bson.M) (*mongo.UpdateResult, error) {
	update = ensureUpdatedAt(update)
	return s.coll.UpdateOne(ctx, s.scopedFilter(filter), update)
}

// UpdateMany updates multiple documents matching the filter within the tenant scope.
func (s *Scope) UpdateMany(ctx context.Context, filter bson.M, update bson.M) (*mongo.UpdateResult, error) {
	update = ensureUpdatedAt(update)
	return s.coll.UpdateMany(ctx, s.scopedFilter(filter), update)
}

// UpdateByID updates a single document by its ObjectID within the tenant scope.
func (s *Scope) UpdateByID(ctx context.Context, id bson.ObjectID, update bson.M) (*mongo.UpdateResult, error) {
	return s.UpdateOne(ctx, bson.M{"_id": id}, update)
}

// SoftDelete marks a document as deleted (sets deletedAt) rather than removing it.
func (s *Scope) SoftDelete(ctx context.Context, id bson.ObjectID) (*mongo.UpdateResult, error) {
	return s.coll.UpdateOne(ctx, s.scopedFilter(bson.M{"_id": id}), bson.M{
		"$set": bson.M{"deletedAt": time.Now().UTC()},
	})
}

// DeleteOne removes a single document matching the filter within the tenant scope.
func (s *Scope) DeleteOne(ctx context.Context, filter bson.M) (*mongo.DeleteResult, error) {
	return s.coll.DeleteOne(ctx, s.scopedFilter(filter))
}

// DeleteMany removes multiple documents matching the filter within the tenant scope.
func (s *Scope) DeleteMany(ctx context.Context, filter bson.M) (*mongo.DeleteResult, error) {
	return s.coll.DeleteMany(ctx, s.scopedFilter(filter))
}

// DeleteByID removes a document by its ID within the tenant scope.
func (s *Scope) DeleteByID(ctx context.Context, id bson.ObjectID) (*mongo.DeleteResult, error) {
	return s.DeleteOne(ctx, bson.M{"_id": id})
}

// Count returns the number of documents matching the filter within the tenant scope.
func (s *Scope) Count(ctx context.Context, filter bson.M) (int64, error) {
	return s.coll.CountDocuments(ctx, s.scopedFilter(filter))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ParseObjectID converts a string to an ObjectID or returns an error.
func ParseObjectID(id string) (bson.ObjectID, error) {
	oid, err := bson.ObjectIDFromHex(id)
	if err != nil {
		return bson.NilObjectID, fmt.Errorf("invalid id: %w", err)
	}
	return oid, nil
}

// ensureUpdatedAt adds updatedAt to a $set operation if not already present.
func ensureUpdatedAt(update bson.M) bson.M {
	if setDoc, ok := update["$set"]; ok {
		if setMap, ok := setDoc.(bson.M); ok {
			if _, hasUpdatedAt := setMap["updatedAt"]; !hasUpdatedAt {
				setMap["updatedAt"] = time.Now().UTC()
			}
		}
	} else {
		update["$set"] = bson.M{"updatedAt": time.Now().UTC()}
	}
	return update
}
