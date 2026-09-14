package staff

import (
	"context"
	"errors"
	"strings"
	"time"

	domainuser "github.com/dineflow/api/internal/domain/user"
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

type InviteStaffInput struct {
	Name  string          `json:"name"`
	Email string          `json:"email"`
	Phone string          `json:"phone"`
	Role  domainuser.Role `json:"role"`
}

func (s *Service) ListStaff(ctx context.Context, tenantID bson.ObjectID) ([]domainuser.User, error) {
	coll := s.db.Collection("users")
	scope := mongoinfra.NewScope(coll, tenantID)

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := scope.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []domainuser.User
	if err := cursor.All(ctx, &users); err != nil {
		return nil, err
	}
	if users == nil {
		users = []domainuser.User{}
	}
	return users, nil
}

func (s *Service) InviteStaff(ctx context.Context, tenantID bson.ObjectID, input InviteStaffInput) (*domainuser.User, error) {
	if input.Name == "" {
		return nil, errors.New("name is required")
	}
	if input.Email == "" && input.Phone == "" {
		return nil, errors.New("email or phone is required")
	}
	if input.Role == "" {
		input.Role = domainuser.RoleWaiter
	}

	coll := s.db.Collection("users")
	scope := mongoinfra.NewScope(coll, tenantID)

	// Check if already exists in this tenant
	filter := bson.M{}
	if input.Email != "" {
		filter["email"] = strings.ToLower(strings.TrimSpace(input.Email))
	} else {
		filter["phone"] = strings.TrimSpace(input.Phone)
	}

	var existing domainuser.User
	err := scope.FindOne(ctx, filter, &existing)
	if err == nil {
		return nil, errors.New("staff member already exists in this workspace")
	} else if err != mongo.ErrNoDocuments {
		return nil, err
	}

	now := time.Now().UTC()
	newUser := domainuser.User{
		ID:          bson.NewObjectID(),
		TenantID:    tenantID,
		Name:        strings.TrimSpace(input.Name),
		Email:       strings.ToLower(strings.TrimSpace(input.Email)),
		Phone:       strings.TrimSpace(input.Phone),
		Role:        input.Role,
		Permissions: domainuser.DefaultPermissionsForRole(input.Role),
		Status:      domainuser.StatusActive,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if _, err := scope.InsertOne(ctx, &newUser); err != nil {
		return nil, err
	}
	return &newUser, nil
}

func (s *Service) UpdateStaff(ctx context.Context, tenantID, userID bson.ObjectID, role domainuser.Role, status domainuser.Status) (*domainuser.User, error) {
	coll := s.db.Collection("users")
	scope := mongoinfra.NewScope(coll, tenantID)

	update := bson.M{
		"$set": bson.M{
			"updatedAt": time.Now().UTC(),
		},
	}
	if role != "" {
		update["$set"].(bson.M)["role"] = role
		update["$set"].(bson.M)["permissions"] = domainuser.DefaultPermissionsForRole(role)
	}
	if status != "" {
		update["$set"].(bson.M)["status"] = status
	}

	res, err := scope.UpdateByID(ctx, userID, update)
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, errors.New("staff member not found")
	}

	var updated domainuser.User
	if err := scope.FindByID(ctx, userID, &updated); err != nil {
		return nil, err
	}
	return &updated, nil
}

func (s *Service) DeleteStaff(ctx context.Context, tenantID, userID bson.ObjectID) error {
	coll := s.db.Collection("users")
	scope := mongoinfra.NewScope(coll, tenantID)

	res, err := scope.DeleteOne(ctx, bson.M{"_id": userID})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("staff member not found")
	}
	return nil
}
