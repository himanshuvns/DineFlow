package table

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	domaintable "github.com/dineflow/api/internal/domain/table"
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

func (s *Service) ListTables(ctx context.Context, tenantID bson.ObjectID) ([]domaintable.Table, error) {
	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, tenantID)

	opts := options.Find().SetSort(bson.D{{Key: "zone", Value: 1}, {Key: "name", Value: 1}})
	cursor, err := scope.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tables []domaintable.Table
	if err := cursor.All(ctx, &tables); err != nil {
		return nil, err
	}
	if tables == nil {
		tables = []domaintable.Table{}
	}
	return tables, nil
}

func (s *Service) ListRooms(ctx context.Context, tenantID bson.ObjectID, floor, wing string) ([]domaintable.Table, error) {
	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, tenantID)

	filter := bson.M{
		"type": bson.M{"$in": []string{
			string(domaintable.TypeRoom),
			string(domaintable.TypeSuite),
			string(domaintable.TypeCabana),
		}},
	}
	if floor != "" {
		filter["floor"] = floor
	}
	if wing != "" {
		filter["wing"] = wing
	}

	opts := options.Find().SetSort(bson.D{{Key: "floor", Value: 1}, {Key: "roomNumber", Value: 1}})
	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var rooms []domaintable.Table
	if err := cursor.All(ctx, &rooms); err != nil {
		return nil, err
	}
	if rooms == nil {
		rooms = []domaintable.Table{}
	}
	return rooms, nil
}

func (s *Service) CreateTable(ctx context.Context, t *domaintable.Table) error {
	t.ID = bson.NewObjectID()
	if t.QRSlug == "" {
		if t.RoomNumber != "" {
			t.QRSlug = fmt.Sprintf("room-%s", strings.ToLower(t.RoomNumber))
		} else {
			t.QRSlug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(t.Name), " ", "-"))
		}
	}
	t.CreatedAt = time.Now().UTC()
	t.UpdatedAt = t.CreatedAt
	if err := t.Validate(); err != nil {
		return err
	}

	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, t.TenantID)
	_, err := scope.InsertOne(ctx, t)
	return err
}

func (s *Service) CreateRoomsBulk(ctx context.Context, tenantID bson.ObjectID, startRoom, endRoom int, floor, wing string, locType domaintable.LocationType) ([]domaintable.Table, error) {
	if endRoom < startRoom || endRoom-startRoom > 100 {
		return nil, errors.New("invalid room number range (maximum 100 rooms per batch)")
	}

	if locType == "" {
		locType = domaintable.TypeRoom
	}

	var created []domaintable.Table
	for r := startRoom; r <= endRoom; r++ {
		rStr := fmt.Sprintf("%d", r)
		name := fmt.Sprintf("Room %s", rStr)
		if locType == domaintable.TypeSuite {
			name = fmt.Sprintf("Suite %s", rStr)
		}

		entry := domaintable.Table{
			TenantID:     tenantID,
			Type:         locType,
			Name:         name,
			Zone:         fmt.Sprintf("Floor %s (%s)", floor, wing),
			Floor:        floor,
			Wing:         wing,
			RoomNumber:   rStr,
			Seats:        2,
			FolioEnabled: true,
			QRSlug:       fmt.Sprintf("room-%s", rStr),
			Status:       domaintable.StatusAvailable,
		}

		if err := s.CreateTable(ctx, &entry); err != nil {
			return nil, err
		}
		created = append(created, entry)
	}

	return created, nil
}

func (s *Service) ResolveTableID(ctx context.Context, tenantID bson.ObjectID, identifier string) (bson.ObjectID, error) {
	cleanID := strings.TrimSpace(identifier)
	if oid, err := bson.ObjectIDFromHex(cleanID); err == nil {
		return oid, nil
	}

	coll := s.db.Collection("tables")
	var tbl domaintable.Table
	err := coll.FindOne(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"qrSlug": cleanID},
			{"qrSlug": strings.ToLower(cleanID)},
			{"name": bson.M{"$regex": "^" + cleanID + "$", "$options": "i"}},
		},
	}).Decode(&tbl)
	if err == nil {
		return tbl.ID, nil
	}
	return bson.NilObjectID, errors.New("table not found")
}

func (s *Service) ToggleDND(ctx context.Context, tenantID bson.ObjectID, identifier string, dnd bool) error {
	id, err := s.ResolveTableID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, tenantID)

	update := bson.M{
		"$set": bson.M{
			"doNotDisturb": dnd,
			"updatedAt":    time.Now().UTC(),
		},
	}
	res, err := scope.UpdateByID(ctx, id, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("room not found")
	}
	return nil
}

func (s *Service) UpdateStatus(ctx context.Context, tenantID bson.ObjectID, identifier string, status domaintable.TableStatus) error {
	id, err := s.ResolveTableID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, tenantID)

	update := bson.M{
		"$set": bson.M{
			"status":    status,
			"updatedAt": time.Now().UTC(),
		},
	}
	res, err := scope.UpdateByID(ctx, id, update)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("table not found")
	}
	return nil
}

func (s *Service) DeleteTable(ctx context.Context, tenantID bson.ObjectID, identifier string) error {
	id, err := s.ResolveTableID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, tenantID)
	res, err := scope.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("table not found")
	}
	return nil
}

func (s *Service) GetTableByQRSlug(ctx context.Context, tenantID bson.ObjectID, qrSlug string) (*domaintable.Table, error) {
	coll := s.db.Collection("tables")
	scope := mongoinfra.NewScope(coll, tenantID)

	var t domaintable.Table
	err := scope.FindOne(ctx, bson.M{"qrSlug": qrSlug}, &t)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("table location not found")
	}
	if err != nil {
		return nil, err
	}
	return &t, nil
}
