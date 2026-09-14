package room

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	domainroom "github.com/dineflow/api/internal/domain/room"
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

// CheckInInput contains parameters for checking in a guest.
type CheckInInput struct {
	Name            string `json:"name" binding:"required"`
	Phone           string `json:"phone" binding:"required"`
	Email           string `json:"email"`
	IDProofType     string `json:"idProofType"`
	SpecialRequests string `json:"specialRequests"`
}

// UpdateRoomInput contains fields that can be updated on a room.
type UpdateRoomInput struct {
	Name         *string   `json:"name"`
	RoomType     *string   `json:"roomType"`
	Floor        *string   `json:"floor"`
	Wing         *string   `json:"wing"`
	Capacity     *int      `json:"capacity"`
	Status       *domainroom.RoomStatus `json:"status"`
	DoNotDisturb *bool     `json:"doNotDisturb"`
	FolioEnabled *bool     `json:"folioEnabled"`
	Amenities    *[]string `json:"amenities"`
	Images       *[]string `json:"images"`
}

// HotelStats represents dynamic hotel PMS metrics.
type HotelStats struct {
	TotalRooms              int     `json:"totalRooms"`
	OccupiedRooms           int     `json:"occupiedRooms"`
	VacantRooms             int     `json:"vacantRooms"`
	CleaningRooms           int     `json:"cleaningRooms"`
	MaintenanceRooms        int     `json:"maintenanceRooms"`
	OccupancyRate           float64 `json:"occupancyRate"`
	CheckInsToday           int     `json:"checkInsToday"`
	CheckOutsToday          int     `json:"checkOutsToday"`
	PendingRoomService      int     `json:"pendingRoomService"`
	ActiveHousekeepingTasks int     `json:"activeHousekeepingTasks"`
}

// ResolveRoomID finds a room ObjectID by hex, roomNumber, or qrSlug.
func (s *Service) ResolveRoomID(ctx context.Context, tenantID bson.ObjectID, identifier string) (bson.ObjectID, error) {
	clean := strings.TrimSpace(identifier)
	if oid, err := bson.ObjectIDFromHex(clean); err == nil {
		return oid, nil
	}

	coll := s.db.Collection("rooms")
	var r domainroom.Room
	err := coll.FindOne(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomNumber": clean},
			{"roomNumber": strings.ToUpper(clean)},
			{"roomNumber": strings.ToLower(clean)},
			{"qrSlug": clean},
			{"qrSlug": strings.ToLower(clean)},
			{"name": bson.M{"$regex": "^" + clean + "$", "$options": "i"}},
		},
	}).Decode(&r)
	if err == nil {
		return r.ID, nil
	}
	return bson.NilObjectID, errors.New("room not found")
}

// ListRooms returns all rooms for a tenant with optional filters.
func (s *Service) ListRooms(ctx context.Context, tenantID bson.ObjectID, floor, wing string, status domainroom.RoomStatus, query string) ([]domainroom.Room, error) {
	coll := s.db.Collection("rooms")
	filter := bson.M{"tenantId": tenantID}

	if floor != "" && floor != "all" {
		filter["floor"] = floor
	}
	if wing != "" && wing != "all" {
		filter["wing"] = wing
	}
	if status != "" && status != "all" {
		filter["status"] = status
	}
	if strings.TrimSpace(query) != "" {
		q := strings.TrimSpace(query)
		filter["$or"] = []bson.M{
			{"name": bson.M{"$regex": q, "$options": "i"}},
			{"roomNumber": bson.M{"$regex": q, "$options": "i"}},
			{"currentGuestName": bson.M{"$regex": q, "$options": "i"}},
		}
	}

	opts := options.Find().SetSort(bson.D{
		{Key: "floor", Value: 1},
		{Key: "roomNumber", Value: 1},
	})
	cursor, err := coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var rooms []domainroom.Room
	if err := cursor.All(ctx, &rooms); err != nil {
		return nil, err
	}
	if rooms == nil {
		rooms = []domainroom.Room{}
	}
	return rooms, nil
}

// GetRoomByID retrieves a single room by ID or room number.
func (s *Service) GetRoomByID(ctx context.Context, tenantID bson.ObjectID, identifier string) (*domainroom.Room, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, err
	}

	coll := s.db.Collection("rooms")
	var r domainroom.Room
	err = coll.FindOne(ctx, bson.M{
		"_id":      roomID,
		"tenantId": tenantID,
	}).Decode(&r)
	if err == mongo.ErrNoDocuments {
		return nil, errors.New("room not found")
	}
	if err != nil {
		return nil, err
	}
	return &r, nil
}

// CreateRoom inserts a new room.
func (s *Service) CreateRoom(ctx context.Context, r *domainroom.Room) error {
	r.ID = bson.NewObjectID()
	now := time.Now().UTC()
	r.CreatedAt = now
	r.UpdatedAt = now

	if err := r.Validate(); err != nil {
		return err
	}

	coll := s.db.Collection("rooms")
	// Verify roomNumber uniqueness within tenant
	count, err := coll.CountDocuments(ctx, bson.M{
		"tenantId":   r.TenantID,
		"roomNumber": r.RoomNumber,
	})
	if err != nil {
		return err
	}
	if count > 0 {
		return fmt.Errorf("room number %s already exists in this hotel", r.RoomNumber)
	}

	_, err = coll.InsertOne(ctx, r)
	return err
}

// UpdateRoom updates room details.
func (s *Service) UpdateRoom(ctx context.Context, tenantID bson.ObjectID, identifier string, input UpdateRoomInput) (*domainroom.Room, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, err
	}

	update := bson.M{"updatedAt": time.Now().UTC()}
	if input.Name != nil {
		update["name"] = *input.Name
	}
	if input.RoomType != nil {
		update["roomType"] = *input.RoomType
	}
	if input.Floor != nil {
		update["floor"] = *input.Floor
	}
	if input.Wing != nil {
		update["wing"] = *input.Wing
	}
	if input.Capacity != nil {
		update["capacity"] = *input.Capacity
	}
	if input.Status != nil {
		update["status"] = *input.Status
	}
	if input.DoNotDisturb != nil {
		update["doNotDisturb"] = *input.DoNotDisturb
	}
	if input.FolioEnabled != nil {
		update["folioEnabled"] = *input.FolioEnabled
	}
	if input.Amenities != nil {
		update["amenities"] = *input.Amenities
	}
	if input.Images != nil {
		update["images"] = *input.Images
	}

	coll := s.db.Collection("rooms")
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updated domainroom.Room
	err = coll.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{"$set": update}, opts).Decode(&updated)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// DeleteRoom removes a room.
func (s *Service) DeleteRoom(ctx context.Context, tenantID bson.ObjectID, identifier string) error {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("rooms")
	res, err := coll.DeleteOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID})
	if err != nil {
		return err
	}
	if res.DeletedCount == 0 {
		return errors.New("room not found")
	}
	return nil
}

// BulkCreateRooms generates contiguous rooms for a floor.
func (s *Service) BulkCreateRooms(ctx context.Context, tenantID bson.ObjectID, startRoom, endRoom int, floor, wing, roomType string, amenities []string) ([]domainroom.Room, error) {
	if endRoom < startRoom || endRoom-startRoom > 100 {
		return nil, errors.New("invalid room range (maximum 100 rooms per batch)")
	}
	if roomType == "" {
		roomType = "room"
	}
	if amenities == nil {
		amenities = []string{"King Bed", "High-Speed Wi-Fi", "Smart TV", "En-Suite Bath"}
	}

	coll := s.db.Collection("rooms")
	now := time.Now().UTC()
	var created []domainroom.Room

	for num := startRoom; num <= endRoom; num++ {
		rStr := fmt.Sprintf("%d", num)
		name := fmt.Sprintf("Room %s", rStr)
		if roomType == "suite" {
			name = fmt.Sprintf("Suite %s", rStr)
		} else if roomType == "penthouse" {
			name = fmt.Sprintf("Penthouse %s", rStr)
		}

		// Check if exists
		count, _ := coll.CountDocuments(ctx, bson.M{"tenantId": tenantID, "roomNumber": rStr})
		if count > 0 {
			continue
		}

		r := domainroom.Room{
			ID:           bson.NewObjectID(),
			TenantID:     tenantID,
			RoomNumber:   rStr,
			Name:         name,
			RoomType:     roomType,
			Floor:        floor,
			Wing:         wing,
			Capacity:     2,
			Status:       domainroom.StatusVacant,
			DoNotDisturb: false,
			FolioEnabled: true,
			QRSlug:       fmt.Sprintf("room-%s", rStr),
			Amenities:    amenities,
			CreatedAt:    now,
			UpdatedAt:    now,
		}

		_, err := coll.InsertOne(ctx, r)
		if err == nil {
			created = append(created, r)
		}
	}

	return created, nil
}

// ToggleDND updates Do Not Disturb flag.
func (s *Service) ToggleDND(ctx context.Context, tenantID bson.ObjectID, identifier string, dnd bool) error {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("rooms")
	res, err := coll.UpdateOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"doNotDisturb": dnd,
			"updatedAt":    time.Now().UTC(),
		},
	})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("room not found")
	}
	return nil
}

// UpdateStatus updates the operational status of a room.
func (s *Service) UpdateStatus(ctx context.Context, tenantID bson.ObjectID, identifier string, status domainroom.RoomStatus) error {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("rooms")
	res, err := coll.UpdateOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"status":    status,
			"updatedAt": time.Now().UTC(),
		},
	})
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return errors.New("room not found")
	}
	return nil
}

// CheckInGuest checks a guest into a room, setting room status to occupied.
func (s *Service) CheckInGuest(ctx context.Context, tenantID bson.ObjectID, identifier string, input CheckInInput) (*domainroom.Guest, *domainroom.Room, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, nil, err
	}

	roomsColl := s.db.Collection("rooms")
	var r domainroom.Room
	err = roomsColl.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)
	if err != nil {
		return nil, nil, errors.New("room not found")
	}

	if r.Status == domainroom.StatusOccupied {
		return nil, nil, fmt.Errorf("room %s is already occupied by %s", r.RoomNumber, r.CurrentGuestName)
	}

	now := time.Now().UTC()
	guest := &domainroom.Guest{
		ID:              bson.NewObjectID(),
		TenantID:        tenantID,
		RoomID:          roomID,
		RoomNumber:      r.RoomNumber,
		Name:            input.Name,
		Phone:           input.Phone,
		Email:           input.Email,
		CheckIn:         now,
		Status:          domainroom.GuestCheckedIn,
		IDProofType:     input.IDProofType,
		SpecialRequests: input.SpecialRequests,
		FolioBalance:    0,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
	if err := guest.Validate(); err != nil {
		return nil, nil, err
	}

	guestsColl := s.db.Collection("guests")
	if _, err := guestsColl.InsertOne(ctx, guest); err != nil {
		return nil, nil, err
	}

	// Update Room
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"status":            domainroom.StatusOccupied,
			"currentGuestId":    guest.ID,
			"currentGuestName":  guest.Name,
			"currentGuestPhone": guest.Phone,
			"updatedAt":         now,
		},
	}, opts).Decode(&updatedRoom)
	if err != nil {
		return nil, nil, err
	}

	return guest, &updatedRoom, nil
}

// CheckOutGuest checks out the active guest, marks room as cleaning, and creates a housekeeping task.
func (s *Service) CheckOutGuest(ctx context.Context, tenantID bson.ObjectID, identifier string) (*domainroom.Room, *domainroom.HousekeepingTask, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, nil, err
	}

	roomsColl := s.db.Collection("rooms")
	var r domainroom.Room
	err = roomsColl.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)
	if err != nil {
		return nil, nil, errors.New("room not found")
	}

	now := time.Now().UTC()

	// Update Guest record if present
	if r.CurrentGuestID != nil && !r.CurrentGuestID.IsZero() {
		guestsColl := s.db.Collection("guests")
		_, _ = guestsColl.UpdateOne(ctx, bson.M{"_id": r.CurrentGuestID, "tenantId": tenantID}, bson.M{
			"$set": bson.M{
				"status":    domainroom.GuestCheckedOut,
				"checkOut":  now,
				"updatedAt": now,
			},
		})
	}

	// Update room to cleaning and clear current guest
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"status":            domainroom.StatusCleaning,
			"currentGuestId":    nil,
			"currentGuestName":  "",
			"currentGuestPhone": "",
			"doNotDisturb":      false,
			"updatedAt":         now,
		},
	}, opts).Decode(&updatedRoom)
	if err != nil {
		return nil, nil, err
	}

	// Create Housekeeping cleaning task
	tasksColl := s.db.Collection("housekeeping_tasks")
	task := &domainroom.HousekeepingTask{
		ID:         bson.NewObjectID(),
		TenantID:   tenantID,
		RoomID:     roomID,
		RoomNumber: r.RoomNumber,
		TaskType:   domainroom.TaskCleaning,
		Title:      fmt.Sprintf("Checkout Deep Clean & Linen Refresh — %s", r.Name),
		Priority:   "high",
		Status:     domainroom.TaskPending,
		Notes:      "Guest checked out. Sanitize suite, change linens, replenish minibar and toiletries.",
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	_, _ = tasksColl.InsertOne(ctx, task)

	return &updatedRoom, task, nil
}

// ListHousekeepingTasks retrieves housekeeping tasks for a tenant.
func (s *Service) ListHousekeepingTasks(ctx context.Context, tenantID bson.ObjectID, roomIdentifier string, status domainroom.TaskStatus) ([]domainroom.HousekeepingTask, error) {
	coll := s.db.Collection("housekeeping_tasks")
	filter := bson.M{"tenantId": tenantID}

	if roomIdentifier != "" && roomIdentifier != "all" {
		if roomID, err := s.ResolveRoomID(ctx, tenantID, roomIdentifier); err == nil {
			filter["roomId"] = roomID
		} else {
			filter["roomNumber"] = roomIdentifier
		}
	}
	if status != "" && status != "all" {
		filter["status"] = status
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := coll.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var tasks []domainroom.HousekeepingTask
	if err := cursor.All(ctx, &tasks); err != nil {
		return nil, err
	}
	if tasks == nil {
		tasks = []domainroom.HousekeepingTask{}
	}
	return tasks, nil
}

// CreateHousekeepingTask creates a task.
func (s *Service) CreateHousekeepingTask(ctx context.Context, t *domainroom.HousekeepingTask) error {
	t.ID = bson.NewObjectID()
	now := time.Now().UTC()
	t.CreatedAt = now
	t.UpdatedAt = now

	if err := t.Validate(); err != nil {
		return err
	}

	coll := s.db.Collection("housekeeping_tasks")
	_, err := coll.InsertOne(ctx, t)
	return err
}

// UpdateHousekeepingTask updates status of a task; if cleaning is completed, room returns to vacant.
func (s *Service) UpdateHousekeepingTask(ctx context.Context, tenantID bson.ObjectID, taskID bson.ObjectID, status domainroom.TaskStatus, notes string) (*domainroom.HousekeepingTask, error) {
	coll := s.db.Collection("housekeeping_tasks")
	now := time.Now().UTC()

	update := bson.M{
		"status":    status,
		"updatedAt": now,
	}
	if notes != "" {
		update["notes"] = notes
	}
	if status == domainroom.TaskCompleted {
		update["completedAt"] = now
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updated domainroom.HousekeepingTask
	err := coll.FindOneAndUpdate(ctx, bson.M{"_id": taskID, "tenantId": tenantID}, bson.M{"$set": update}, opts).Decode(&updated)
	if err != nil {
		return nil, err
	}

	// If cleaning task completed, mark room clean & ready (vacant)
	if status == domainroom.TaskCompleted && updated.TaskType == domainroom.TaskCleaning {
		roomsColl := s.db.Collection("rooms")
		var r domainroom.Room
		if err := roomsColl.FindOne(ctx, bson.M{"_id": updated.RoomID, "tenantId": tenantID}).Decode(&r); err == nil {
			if r.Status == domainroom.StatusCleaning {
				_, _ = roomsColl.UpdateOne(ctx, bson.M{"_id": updated.RoomID}, bson.M{
					"$set": bson.M{
						"status":    domainroom.StatusVacant,
						"updatedAt": now,
					},
				})
			}
		}
	}

	return &updated, nil
}

// GetRoomOrders retrieves all active and historical room service orders for a room.
func (s *Service) GetRoomOrders(ctx context.Context, tenantID bson.ObjectID, roomNumber string) ([]bson.M, error) {
	ordersColl := s.db.Collection("orders")
	rClean := strings.TrimSpace(roomNumber)

	filter := bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomNumber": rClean},
			{"roomNumber": strings.ToUpper(rClean)},
			{"roomNumber": strings.ToLower(rClean)},
			{"tableName": bson.M{"$regex": rClean, "$options": "i"}},
		},
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(50)
	cursor, err := ordersColl.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var orders []bson.M
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}
	if orders == nil {
		orders = []bson.M{}
	}
	return orders, nil
}

// GetHotelStats calculates real-time PMS KPIs.
func (s *Service) GetHotelStats(ctx context.Context, tenantID bson.ObjectID) (*HotelStats, error) {
	roomsColl := s.db.Collection("rooms")
	guestsColl := s.db.Collection("guests")
	tasksColl := s.db.Collection("housekeeping_tasks")
	ordersColl := s.db.Collection("orders")

	total, _ := roomsColl.CountDocuments(ctx, bson.M{"tenantId": tenantID})
	occupied, _ := roomsColl.CountDocuments(ctx, bson.M{"tenantId": tenantID, "status": domainroom.StatusOccupied})
	vacant, _ := roomsColl.CountDocuments(ctx, bson.M{"tenantId": tenantID, "status": domainroom.StatusVacant})
	cleaning, _ := roomsColl.CountDocuments(ctx, bson.M{"tenantId": tenantID, "status": domainroom.StatusCleaning})
	maint, _ := roomsColl.CountDocuments(ctx, bson.M{"tenantId": tenantID, "status": bson.M{"$in": []domainroom.RoomStatus{domainroom.StatusMaintenance, domainroom.StatusOutOfService}}})

	var occupancyRate float64
	if total > 0 {
		occupancyRate = (float64(occupied) / float64(total)) * 100.0
	}

	todayStart := time.Now().UTC().Truncate(24 * time.Hour)
	checkinsToday, _ := guestsColl.CountDocuments(ctx, bson.M{
		"tenantId": tenantID,
		"checkIn":  bson.M{"$gte": todayStart},
	})
	checkoutsToday, _ := guestsColl.CountDocuments(ctx, bson.M{
		"tenantId": tenantID,
		"checkOut": bson.M{"$gte": todayStart},
	})

	pendingOrders, _ := ordersColl.CountDocuments(ctx, bson.M{
		"tenantId":    tenantID,
		"destination": "room_service",
		"status":      bson.M{"$in": []string{"pending", "preparing", "ready"}},
	})

	activeTasks, _ := tasksColl.CountDocuments(ctx, bson.M{
		"tenantId": tenantID,
		"status":   bson.M{"$in": []domainroom.TaskStatus{domainroom.TaskPending, domainroom.TaskInProgress}},
	})

	return &HotelStats{
		TotalRooms:              int(total),
		OccupiedRooms:           int(occupied),
		VacantRooms:             int(vacant),
		CleaningRooms:           int(cleaning),
		MaintenanceRooms:        int(maint),
		OccupancyRate:           occupancyRate,
		CheckInsToday:           int(checkinsToday),
		CheckOutsToday:          int(checkoutsToday),
		PendingRoomService:      int(pendingOrders),
		ActiveHousekeepingTasks: int(activeTasks),
	}, nil
}

// GetPublicRoom resolves tenant and returns room details for QR in-room dining.
func (s *Service) GetPublicRoom(ctx context.Context, tenantSlug, roomIdentifier string) (*domainroom.Room, string, error) {
	tenantsColl := s.db.Collection("tenants")
	var t struct {
		ID   bson.ObjectID `bson:"_id"`
		Name string        `bson:"name"`
		Slug string        `bson:"slug"`
	}

	slugClean := strings.TrimSpace(tenantSlug)
	err := tenantsColl.FindOne(ctx, bson.M{
		"$or": []bson.M{
			{"slug": slugClean},
			{"slug": strings.ToLower(slugClean)},
		},
	}).Decode(&t)
	if err != nil {
		return nil, "", errors.New("tenant not found")
	}

	room, err := s.GetRoomByID(ctx, t.ID, roomIdentifier)
	if err != nil {
		// Fallback: create on demand if legitimate hotel room
		rNum := strings.TrimPrefix(strings.TrimPrefix(strings.ToLower(roomIdentifier), "room-"), "suite-")
		if rNum != "" {
			newRoom := &domainroom.Room{
				TenantID:   t.ID,
				RoomNumber: strings.ToUpper(rNum),
				Name:       fmt.Sprintf("Suite %s", strings.ToUpper(rNum)),
				RoomType:   "suite",
				Floor:      "Floor 2",
				Wing:       "Main",
				Capacity:   2,
				Status:     domainroom.StatusVacant,
				QRSlug:     fmt.Sprintf("room-%s", strings.ToLower(rNum)),
				Amenities:  []string{"High-Speed Wi-Fi", "Silver Tray Service", "King Bed"},
			}
			if err := s.CreateRoom(ctx, newRoom); err == nil {
				return newRoom, t.Name, nil
			}
		}
		return nil, "", errors.New("room not found")
	}

	return room, t.Name, nil
}
