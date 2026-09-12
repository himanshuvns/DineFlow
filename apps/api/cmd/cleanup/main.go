// cleanup is a one-shot CLI tool to compact MongoDB and remove orphaned data.
package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

func main() {
	uri := os.Getenv("MONGODB_URI")
	dbName := os.Getenv("MONGODB_DATABASE")
	if dbName == "" {
		dbName = "dineflow"
	}
	if uri == "" {
		log.Fatal("MONGODB_URI env var not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	defer func() { _ = client.Disconnect(ctx) }()

	db := client.Database(dbName)

	// Print current stats
	var statsResult bson.M
	if err := db.RunCommand(ctx, bson.D{{Key: "dbStats", Value: 1}}).Decode(&statsResult); err != nil {
		log.Printf("dbStats error: %v", err)
	} else {
		dataSize, _ := statsResult["dataSize"].(float64)
		storageSize, _ := statsResult["storageSize"].(float64)
		indexSize, _ := statsResult["indexSize"].(float64)
		fmt.Printf("Before cleanup:\n  dataSize=%.1fMB  storageSize=%.1fMB  indexSize=%.1fMB\n\n",
			dataSize/1024/1024, storageSize/1024/1024, indexSize/1024/1024)
	}

	// Delete orphaned tenants
	tenantsColl := db.Collection("tenants")
	usersColl := db.Collection("users")

	cursor, err := tenantsColl.Find(ctx, bson.M{})
	if err != nil {
		log.Fatalf("find tenants: %v", err)
	}
	var tenants []struct {
		ID   bson.ObjectID `bson:"_id"`
		Name string        `bson:"name"`
		Slug string        `bson:"slug"`
	}
	if err := cursor.All(ctx, &tenants); err != nil {
		log.Fatalf("decode tenants: %v", err)
	}

	orphanedTenantIDs := []bson.ObjectID{}
	for _, t := range tenants {
		count, err := usersColl.CountDocuments(ctx, bson.M{"tenantId": t.ID})
		if err != nil {
			log.Printf("count users for tenant %s: %v", t.ID.Hex(), err)
			continue
		}
		if count == 0 {
			fmt.Printf("  Orphaned tenant: %s (%s)\n", t.Name, t.Slug)
			orphanedTenantIDs = append(orphanedTenantIDs, t.ID)
		}
	}

	if len(orphanedTenantIDs) > 0 {
		res, err := tenantsColl.DeleteMany(ctx, bson.M{"_id": bson.M{"$in": orphanedTenantIDs}})
		if err != nil {
			log.Printf("delete orphaned tenants: %v", err)
		} else {
			fmt.Printf("Deleted %d orphaned tenant(s)\n", res.DeletedCount)
		}
	} else {
		fmt.Println("No orphaned tenants found")
	}

	// Delete stale unverified users (older than 24h)
	cutoff := time.Now().UTC().Add(-24 * time.Hour)
	res, err := usersColl.DeleteMany(ctx, bson.M{
		"status":    "invited",
		"createdAt": bson.M{"$lt": cutoff},
	})
	if err != nil {
		log.Printf("delete stale users: %v", err)
	} else {
		fmt.Printf("Deleted %d stale unverified user(s)\n", res.DeletedCount)
	}

	// Compact all collections
	collections, _ := db.ListCollectionNames(ctx, bson.M{})
	for _, coll := range collections {
		fmt.Printf("Compacting %s... ", coll)
		var result bson.M
		err := db.RunCommand(ctx, bson.D{{Key: "compact", Value: coll}}).Decode(&result)
		if err != nil {
			fmt.Printf("error: %v\n", err)
		} else {
			fmt.Println("done")
		}
	}

	// Print stats after
	if err := db.RunCommand(ctx, bson.D{{Key: "dbStats", Value: 1}}).Decode(&statsResult); err != nil {
		log.Printf("dbStats error: %v", err)
	} else {
		dataSize, _ := statsResult["dataSize"].(float64)
		storageSize, _ := statsResult["storageSize"].(float64)
		indexSize, _ := statsResult["indexSize"].(float64)
		fmt.Printf("\nAfter cleanup:\n  dataSize=%.1fMB  storageSize=%.1fMB  indexSize=%.1fMB\n",
			dataSize/1024/1024, storageSize/1024/1024, indexSize/1024/1024)
	}

	fmt.Println("\n✅ Cleanup complete")
}
