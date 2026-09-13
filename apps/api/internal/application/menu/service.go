package menu

import (
	"context"
	"errors"
	"strings"
	"time"

	domainmenu "github.com/dineflow/api/internal/domain/menu"
	"github.com/dineflow/api/internal/domain/tenant"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Service struct {
	db *mongoinfra.Client
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

// ─── Categories ───────────────────────────────────────────────────────────────

func (s *Service) ListCategories(ctx context.Context, tenantID bson.ObjectID) ([]domainmenu.Category, error) {
	coll := s.db.Collection("menu_categories")
	scope := mongoinfra.NewScope(coll, tenantID)

	opts := options.Find().SetSort(bson.D{{Key: "displayOrder", Value: 1}, {Key: "createdAt", Value: 1}})
	cursor, err := scope.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []domainmenu.Category
	if err := cursor.All(ctx, &categories); err != nil {
		return nil, err
	}
	if categories == nil {
		categories = []domainmenu.Category{}
	}
	return categories, nil
}

func (s *Service) CreateCategory(ctx context.Context, cat *domainmenu.Category) error {
	cat.ID = bson.NewObjectID()
	cat.Slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(cat.Name), " ", "-"))
	cat.CreatedAt = time.Now().UTC()
	cat.UpdatedAt = cat.CreatedAt
	if err := cat.Validate(); err != nil {
		return err
	}

	coll := s.db.Collection("menu_categories")
	scope := mongoinfra.NewScope(coll, cat.TenantID)
	_, err := scope.InsertOne(ctx, cat)
	return err
}

func (s *Service) UpdateCategory(ctx context.Context, tenantID, id bson.ObjectID, name, desc string, order int, isActive bool) error {
	coll := s.db.Collection("menu_categories")
	scope := mongoinfra.NewScope(coll, tenantID)

	update := bson.M{
		"$set": bson.M{
			"name":         name,
			"description":  desc,
			"displayOrder": order,
			"isActive":     isActive,
			"updatedAt":    time.Now().UTC(),
		},
	}
	res, err := scope.UpdateByID(ctx, id, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("category not found")
	}
	return nil
}

func (s *Service) DeleteCategory(ctx context.Context, tenantID, id bson.ObjectID) error {
	coll := s.db.Collection("menu_categories")
	scope := mongoinfra.NewScope(coll, tenantID)
	res, err := scope.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("category not found")
	}
	return nil
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

func (s *Service) ListItems(ctx context.Context, tenantID bson.ObjectID, categoryID *bson.ObjectID) ([]domainmenu.MenuItem, error) {
	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, tenantID)

	filter := bson.M{}
	if categoryID != nil && !categoryID.IsZero() {
		filter["categoryId"] = *categoryID
	}

	opts := options.Find().SetSort(bson.D{{Key: "displayOrder", Value: 1}, {Key: "name", Value: 1}})
	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var items []domainmenu.MenuItem
	if err := cursor.All(ctx, &items); err != nil {
		return nil, err
	}
	if items == nil {
		items = []domainmenu.MenuItem{}
	}
	return items, nil
}

func (s *Service) CreateItem(ctx context.Context, item *domainmenu.MenuItem) error {
	item.ID = bson.NewObjectID()
	item.Slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(item.Name), " ", "-"))
	item.CreatedAt = time.Now().UTC()
	item.UpdatedAt = item.CreatedAt
	if err := item.Validate(); err != nil {
		return err
	}

	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, item.TenantID)
	_, err := scope.InsertOne(ctx, item)
	return err
}

func (s *Service) ToggleAvailability(ctx context.Context, tenantID, id bson.ObjectID, isAvailable bool) error {
	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, tenantID)

	update := bson.M{
		"$set": bson.M{
			"isAvailable": isAvailable,
			"updatedAt":   time.Now().UTC(),
		},
	}
	res, err := scope.UpdateByID(ctx, id, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("menu item not found")
	}
	return nil
}

func (s *Service) DeleteItem(ctx context.Context, tenantID, id bson.ObjectID) error {
	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, tenantID)
	res, err := scope.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("menu item not found")
	}
	return nil
}

func (s *Service) BulkCreateItems(ctx context.Context, tenantID bson.ObjectID, items []*domainmenu.MenuItem) error {
	if len(items) == 0 {
		return nil
	}
	docs := make([]interface{}, len(items))
	now := time.Now().UTC()
	for i, itm := range items {
		itm.ID = bson.NewObjectID()
		itm.TenantID = tenantID
		itm.Slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(itm.Name), " ", "-"))
		itm.CreatedAt = now
		itm.UpdatedAt = now
		if itm.Currency == "" {
			itm.Currency = "INR"
		}
		docs[i] = itm
	}

	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, tenantID)
	_, err := scope.InsertMany(ctx, docs)
	return err
}

func (s *Service) BulkUpdateItems(ctx context.Context, tenantID bson.ObjectID, ids []bson.ObjectID, updates bson.M) error {
	if len(ids) == 0 || len(updates) == 0 {
		return nil
	}
	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, tenantID)
	updates["updatedAt"] = time.Now().UTC()

	_, err := scope.UpdateMany(ctx, bson.M{"_id": bson.M{"$in": ids}}, bson.M{"$set": updates})
	return err
}

func (s *Service) BulkDeleteItems(ctx context.Context, tenantID bson.ObjectID, ids []bson.ObjectID) error {
	if len(ids) == 0 {
		return nil
	}
	coll := s.db.Collection("menu_items")
	scope := mongoinfra.NewScope(coll, tenantID)

	_, err := scope.DeleteMany(ctx, bson.M{"_id": bson.M{"$in": ids}})
	return err
}

// ─── Public QR Menu Query ─────────────────────────────────────────────────────

type PublicMenuResponse struct {
	Tenant     *tenant.Tenant          `json:"tenant"`
	Categories []PublicCategorySection `json:"categories"`
}

type PublicCategorySection struct {
	Category domainmenu.Category     `json:"category"`
	Items    []domainmenu.MenuItem   `json:"items"`
}

func (s *Service) GetPublicMenuBySlug(ctx context.Context, slug string) (*PublicMenuResponse, error) {
	// Find tenant
	tenantColl := s.db.Collection("tenants")
	var t tenant.Tenant
	err := tenantColl.FindOne(ctx, bson.M{"slug": slug}).Decode(&t)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("restaurant not found")
	}
	if err != nil {
		return nil, err
	}

	// Find active categories
	categories, err := s.ListCategories(ctx, t.ID)
	if err != nil {
		return nil, err
	}

	// Find active items
	items, err := s.ListItems(ctx, t.ID, nil)
	if err != nil {
		return nil, err
	}

	// Group items into categories
	itemsByCat := make(map[bson.ObjectID][]domainmenu.MenuItem)
	for _, itm := range items {
		if itm.IsAvailable {
			itemsByCat[itm.CategoryID] = append(itemsByCat[itm.CategoryID], itm)
		}
	}

	var sections []PublicCategorySection
	for _, cat := range categories {
		if cat.IsActive {
			catItems := itemsByCat[cat.ID]
			if catItems == nil {
				catItems = []domainmenu.MenuItem{}
			}
			sections = append(sections, PublicCategorySection{
				Category: cat,
				Items:    catItems,
			})
		}
	}

	return &PublicMenuResponse{
		Tenant:     &t,
		Categories: sections,
	}, nil
}
