package room

import (
	"context"
	"errors"
	"fmt"
	"math"
	"regexp"
	"strings"
	"time"

	domainorder "github.com/dineflow/api/internal/domain/order"
	domainroom "github.com/dineflow/api/internal/domain/room"
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

// CheckInInput contains parameters for checking in a guest.
type CheckInInput struct {
	Name             string     `json:"name" binding:"required"`
	Phone            string     `json:"phone" binding:"required"`
	Email            string     `json:"email"`
	NumberOfGuests   int        `json:"numberOfGuests"`
	CheckIn          *time.Time `json:"checkIn"`
	ExpectedCheckOut *time.Time `json:"expectedCheckOut"`
	Address          string     `json:"address"`
	Nationality      string     `json:"nationality"`
	IDProofType      string     `json:"idProofType"`
	IDProofURL       string     `json:"idProofUrl"`
	SpecialRequests  string     `json:"specialRequests"`
}

// StaySummary holds the itemized bill and folio statement upon guest check-out.
type StaySummary struct {
	GuestID           string              `json:"guestId"`
	GuestName         string              `json:"guestName"`
	GuestPhone        string              `json:"guestPhone"`
	GuestEmail        string              `json:"guestEmail,omitempty"`
	NumberOfGuests    int                 `json:"numberOfGuests"`
	Address           string              `json:"address,omitempty"`
	Nationality       string              `json:"nationality,omitempty"`
	IDProofType       string              `json:"idProofType,omitempty"`
	IDProofURL        string              `json:"idProofUrl,omitempty"`
	RoomID            string              `json:"roomId"`
	RoomNumber        string              `json:"roomNumber"`
	RoomName          string              `json:"roomName"`
	RoomType          string              `json:"roomType"`
	Floor             string              `json:"floor"`
	Wing              string              `json:"wing"`
	CheckIn           time.Time           `json:"checkIn"`
	CheckOut          time.Time           `json:"checkOut"`
	StayDuration      string              `json:"stayDuration"`
	RoomServiceOrders []domainorder.Order `json:"roomServiceOrders"`
	TotalOrders       int                 `json:"totalOrders"`
	PendingOrders     int                 `json:"pendingOrders"`
	TotalFoodAmount   float64             `json:"totalFoodAmount"`
	FolioBalance      float64             `json:"folioBalance"`
	SettlementStatus  string              `json:"settlementStatus"` // "settled", "charged_to_folio"
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

	stripped := strings.TrimPrefix(strings.TrimPrefix(strings.ToLower(clean), "room-"), "suite-")

	coll := s.db.Collection("rooms")
	var r domainroom.Room
	err := coll.FindOne(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomNumber": clean},
			{"roomNumber": strings.ToUpper(clean)},
			{"roomNumber": strings.ToLower(clean)},
			{"roomNumber": stripped},
			{"roomNumber": strings.ToUpper(stripped)},
			{"qrSlug": clean},
			{"qrSlug": strings.ToLower(clean)},
			{"qrSlug": "room-" + stripped},
			{"name": bson.M{"$regex": "^" + regexp.QuoteMeta(clean) + "$", "$options": "i"}},
			{"name": bson.M{"$regex": "^Suite " + regexp.QuoteMeta(stripped) + "$", "$options": "i"}},
			{"name": bson.M{"$regex": "^Room " + regexp.QuoteMeta(stripped) + "$", "$options": "i"}},
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
	for i := range rooms {
		if rooms[i].Status == domainroom.StatusOccupied {
			if (rooms[i].CurrentGuestCheckIn == nil || rooms[i].CurrentGuestExpectedCheckOut == nil) && rooms[i].CurrentGuestID != nil && !rooms[i].CurrentGuestID.IsZero() {
				var g domainroom.Guest
				if err := s.db.Collection("guests").FindOne(ctx, bson.M{"_id": rooms[i].CurrentGuestID, "tenantId": tenantID}).Decode(&g); err == nil {
					if rooms[i].CurrentGuestCheckIn == nil && !g.CheckIn.IsZero() {
						rooms[i].CurrentGuestCheckIn = &g.CheckIn
					}
					if rooms[i].CurrentGuestExpectedCheckOut == nil && g.ExpectedCheckOut != nil {
						rooms[i].CurrentGuestExpectedCheckOut = g.ExpectedCheckOut
					}
				}
			}
		}
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

	if r.CurrentGuestID != nil && !r.CurrentGuestID.IsZero() {
		var g domainroom.Guest
		if err := s.db.Collection("guests").FindOne(ctx, bson.M{"_id": r.CurrentGuestID, "tenantId": tenantID}).Decode(&g); err == nil {
			r.CurrentGuest = &g
			if r.CurrentGuestCheckIn == nil && !g.CheckIn.IsZero() {
				r.CurrentGuestCheckIn = &g.CheckIn
			}
			if r.CurrentGuestExpectedCheckOut == nil && g.ExpectedCheckOut != nil {
				r.CurrentGuestExpectedCheckOut = g.ExpectedCheckOut
			}
		}
	}
	if r.CurrentGuest == nil && r.Status == domainroom.StatusOccupied {
		var g domainroom.Guest
		if err := s.db.Collection("guests").FindOne(ctx, bson.M{"roomId": r.ID, "status": domainroom.GuestCheckedIn}, options.FindOne().SetSort(bson.D{{Key: "checkIn", Value: -1}})).Decode(&g); err == nil {
			r.CurrentGuest = &g
			if r.CurrentGuestCheckIn == nil && !g.CheckIn.IsZero() {
				r.CurrentGuestCheckIn = &g.CheckIn
			}
			if r.CurrentGuestExpectedCheckOut == nil && g.ExpectedCheckOut != nil {
				r.CurrentGuestExpectedCheckOut = g.ExpectedCheckOut
			}
		}
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

// GetRoomDNDStatus retrieves DND preference for a room.
func (s *Service) GetRoomDNDStatus(ctx context.Context, tenantID bson.ObjectID, identifier string) (bool, *time.Time, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return false, nil, err
	}

	var pref domainroom.RoomPreference
	prefColl := s.db.Collection("room_preferences")
	err = prefColl.FindOne(ctx, bson.M{"tenantId": tenantID, "roomId": roomID}).Decode(&pref)
	if err == nil {
		return pref.DNDStatus, &pref.UpdatedAt, nil
	}

	var r domainroom.Room
	err = s.db.Collection("rooms").FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)
	if err != nil {
		return false, nil, err
	}
	return r.DoNotDisturb, &r.UpdatedAt, nil
}

// UpdateRoomDND updates Do Not Disturb flag in room_preferences collection and syncs to room.
func (s *Service) UpdateRoomDND(ctx context.Context, tenantID bson.ObjectID, identifier string, dnd bool, updatedBy string) (*domainroom.Room, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, err
	}

	now := time.Now().UTC()
	roomsColl := s.db.Collection("rooms")
	var r domainroom.Room
	err = roomsColl.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)
	if err != nil {
		return nil, errors.New("room not found")
	}

	if updatedBy == "" {
		updatedBy = "guest"
	}

	// 1. Upsert into room_preferences collection
	prefColl := s.db.Collection("room_preferences")
	prefUpdate := bson.M{
		"$set": bson.M{
			"dndStatus": dnd,
			"bookingId": r.CurrentGuestID,
			"updatedBy": updatedBy,
			"updatedAt": now,
		},
		"$setOnInsert": bson.M{
			"_id":      bson.NewObjectID(),
			"tenantId": tenantID,
			"roomId":   roomID,
		},
	}
	_, _ = prefColl.UpdateOne(ctx, bson.M{"tenantId": tenantID, "roomId": roomID}, prefUpdate, options.UpdateOne().SetUpsert(true))

	// 2. Update room document
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"doNotDisturb": dnd,
			"updatedAt":    now,
		},
	}, opts).Decode(&updatedRoom)
	if err != nil {
		return nil, err
	}

	return &updatedRoom, nil
}

// ToggleDND updates Do Not Disturb flag.
func (s *Service) ToggleDND(ctx context.Context, tenantID bson.ObjectID, identifier string, dnd bool) error {
	_, err := s.UpdateRoomDND(ctx, tenantID, identifier, dnd, "staff")
	return err
}

// UpdateStatus updates the operational status of a room.
func (s *Service) UpdateStatus(ctx context.Context, tenantID bson.ObjectID, identifier string, status domainroom.RoomStatus) error {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	coll := s.db.Collection("rooms")
	if status == domainroom.StatusVacant {
		var r domainroom.Room
		if err := coll.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r); err == nil {
			if r.DoNotDisturb {
				return errors.New("cannot mark room service-ready while Do Not Disturb (DND) is active")
			}
		}
	}

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
	checkInTime := now
	if input.CheckIn != nil && !input.CheckIn.IsZero() {
		checkInTime = *input.CheckIn
	}

	numGuests := input.NumberOfGuests
	if numGuests <= 0 {
		numGuests = 1
	}
	maxCap := r.Capacity
	if maxCap <= 0 {
		maxCap = 2
	}
	if numGuests > maxCap {
		return nil, nil, fmt.Errorf("number of guests (%d) exceeds room capacity of %d", numGuests, maxCap)
	}

	nationality := strings.TrimSpace(input.Nationality)
	if nationality == "" {
		nationality = "Indian"
	}

	var idProofUploadedAt *time.Time
	if input.IDProofURL != "" {
		idProofUploadedAt = &now
	}

	guest := &domainroom.Guest{
		ID:                bson.NewObjectID(),
		TenantID:          tenantID,
		RoomID:            roomID,
		RoomNumber:        r.RoomNumber,
		Name:              strings.TrimSpace(input.Name),
		Phone:             strings.TrimSpace(input.Phone),
		Email:             strings.TrimSpace(input.Email),
		NumberOfGuests:    numGuests,
		CheckIn:           checkInTime,
		ExpectedCheckOut:  input.ExpectedCheckOut,
		Status:            domainroom.GuestCheckedIn,
		Address:           strings.TrimSpace(input.Address),
		Nationality:       nationality,
		IDProofType:       input.IDProofType,
		IDProofURL:        input.IDProofURL,
		IDProofUploadedAt: idProofUploadedAt,
		SpecialRequests:   input.SpecialRequests,
		FolioBalance:      0,
		CreatedAt:         now,
		UpdatedAt:         now,
	}
	if err := guest.Validate(); err != nil {
		return nil, nil, err
	}

	guestsColl := s.db.Collection("guests")
	if _, err := guestsColl.InsertOne(ctx, guest); err != nil {
		return nil, nil, err
	}

	// Purge any stale housekeeping tasks and past orders from previous stays for this room
	tasksColl := s.db.Collection("housekeeping_tasks")
	_, _ = tasksColl.DeleteMany(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomId": roomID},
			{"roomNumber": r.RoomNumber},
			{"roomNumber": strings.ToUpper(r.RoomNumber)},
			{"roomNumber": strings.ToLower(r.RoomNumber)},
		},
	})

	ordersColl := s.db.Collection("orders")
	rmNum := r.RoomNumber
	_, _ = ordersColl.DeleteMany(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomId": roomID},
			{"roomNumber": rmNum},
			{"roomNumber": strings.ToUpper(rmNum)},
			{"roomNumber": strings.ToLower(rmNum)},
			{"tableName": rmNum},
			{"tableName": "Suite " + rmNum},
			{"tableName": "Room " + rmNum},
			{"tableSlug": fmt.Sprintf("room-%s", strings.ToLower(rmNum))},
			{"tableSlug": fmt.Sprintf("suite-%s", strings.ToLower(rmNum))},
		},
	})

	// Update Room
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"status":                       domainroom.StatusOccupied,
			"currentGuestId":               guest.ID,
			"currentGuestName":             guest.Name,
			"currentGuestPhone":            guest.Phone,
			"currentGuestCheckIn":          &checkInTime,
			"currentGuestExpectedCheckOut": guest.ExpectedCheckOut,
			"updatedAt":                    now,
		},
	}, opts).Decode(&updatedRoom)
	if err != nil {
		return nil, nil, err
	}

	return guest, &updatedRoom, nil
}

// UpdateGuestStay updates an active guest's stay information and synchronizes the room record.
func (s *Service) UpdateGuestStay(ctx context.Context, tenantID bson.ObjectID, identifier string, input domainroom.UpdateGuestStayInput) (*domainroom.Guest, *domainroom.Room, error) {
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

	if r.Status != domainroom.StatusOccupied && (r.CurrentGuestID == nil || r.CurrentGuestID.IsZero()) {
		return nil, nil, errors.New("cannot edit stay: room is not occupied by an active guest")
	}

	guestsColl := s.db.Collection("guests")
	var g domainroom.Guest
	if r.CurrentGuestID != nil && !r.CurrentGuestID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{"_id": *r.CurrentGuestID, "tenantId": tenantID}).Decode(&g)
	}
	if g.ID.IsZero() {
		// Fallback: find by roomId and status == checked_in
		_ = guestsColl.FindOne(ctx, bson.M{"roomId": roomID, "tenantId": tenantID, "status": domainroom.GuestCheckedIn}, options.FindOne().SetSort(bson.D{{Key: "checkIn", Value: -1}})).Decode(&g)
	}
	if g.ID.IsZero() {
		return nil, nil, errors.New("active guest record not found for this suite")
	}

	now := time.Now().UTC()
	guestUpdate := bson.M{"updatedAt": now}
	roomUpdate := bson.M{"updatedAt": now}

	if input.Name != nil && strings.TrimSpace(*input.Name) != "" {
		cleanName := strings.TrimSpace(*input.Name)
		guestUpdate["name"] = cleanName
		roomUpdate["currentGuestName"] = cleanName
	}
	if input.Phone != nil && strings.TrimSpace(*input.Phone) != "" {
		normalizedPhone, err := domainroom.ValidateAndNormalizeIndianPhone(*input.Phone)
		if err == nil {
			guestUpdate["phone"] = normalizedPhone
			roomUpdate["currentGuestPhone"] = normalizedPhone
		} else {
			cleanPhone := strings.TrimSpace(*input.Phone)
			guestUpdate["phone"] = cleanPhone
			roomUpdate["currentGuestPhone"] = cleanPhone
		}
	}
	if input.Email != nil {
		guestUpdate["email"] = strings.TrimSpace(*input.Email)
	}
	if input.NumberOfGuests != nil {
		numGuests := *input.NumberOfGuests
		if numGuests <= 0 {
			numGuests = 1
		}
		maxCap := r.Capacity
		if maxCap <= 0 {
			maxCap = 2
		}
		if numGuests > maxCap {
			return nil, nil, fmt.Errorf("number of guests (%d) exceeds room capacity of %d", numGuests, maxCap)
		}
		guestUpdate["numberOfGuests"] = numGuests
	}
	if input.CheckIn != nil && !input.CheckIn.IsZero() {
		guestUpdate["checkIn"] = *input.CheckIn
		roomUpdate["currentGuestCheckIn"] = input.CheckIn
	}
	if input.ExpectedCheckOut != nil {
		guestUpdate["expectedCheckOut"] = input.ExpectedCheckOut
		roomUpdate["currentGuestExpectedCheckOut"] = input.ExpectedCheckOut
	}
	if input.Address != nil {
		guestUpdate["address"] = strings.TrimSpace(*input.Address)
	}
	if input.Nationality != nil {
		guestUpdate["nationality"] = strings.TrimSpace(*input.Nationality)
	}
	if input.IDProofType != nil {
		guestUpdate["idProofType"] = strings.TrimSpace(*input.IDProofType)
	}
	if input.IDProofURL != nil && strings.TrimSpace(*input.IDProofURL) != "" {
		guestUpdate["idProofUrl"] = strings.TrimSpace(*input.IDProofURL)
		guestUpdate["idProofUploadedAt"] = now
	}
	if input.SpecialRequests != nil {
		guestUpdate["specialRequests"] = strings.TrimSpace(*input.SpecialRequests)
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedGuest domainroom.Guest
	err = guestsColl.FindOneAndUpdate(ctx, bson.M{"_id": g.ID, "tenantId": tenantID}, bson.M{"$set": guestUpdate}, opts).Decode(&updatedGuest)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to update guest record: %w", err)
	}

	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{"$set": roomUpdate}, opts).Decode(&updatedRoom)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to update room record: %w", err)
	}
	updatedRoom.CurrentGuest = &updatedGuest

	return &updatedGuest, &updatedRoom, nil
}

// GetStaySummary calculates an itemized stay statement and folio breakdown for checkout.
func (s *Service) GetStaySummary(ctx context.Context, tenantID bson.ObjectID, identifier string) (*StaySummary, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, err
	}

	roomsColl := s.db.Collection("rooms")
	var r domainroom.Room
	err = roomsColl.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)
	if err != nil {
		return nil, errors.New("room not found")
	}

	var g domainroom.Guest
	guestsColl := s.db.Collection("guests")
	if r.CurrentGuestID != nil && !r.CurrentGuestID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{"_id": *r.CurrentGuestID, "tenantId": tenantID}).Decode(&g)
	}
	if g.ID.IsZero() {
		// Fallback: check most recent guest for this room
		opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
		_ = guestsColl.FindOne(ctx, bson.M{"tenantId": tenantID, "roomId": roomID}, opts).Decode(&g)
	}

	// Fetch room orders
	roomOrders, _ := s.GetRoomOrders(ctx, tenantID, r.RoomNumber)

	checkInTime := g.CheckIn
	if checkInTime.IsZero() {
		checkInTime = r.UpdatedAt
	}
	checkOutTime := time.Now().UTC()
	if g.CheckOut != nil && !g.CheckOut.IsZero() {
		checkOutTime = *g.CheckOut
	}

	// Compute stay duration
	diff := checkOutTime.Sub(checkInTime)
	hours := int(diff.Hours())
	days := hours / 24
	remHours := hours % 24
	var durationStr string
	if days > 0 {
		durationStr = fmt.Sprintf("%d night(s), %d hour(s)", days, remHours)
	} else if remHours > 0 {
		durationStr = fmt.Sprintf("%d hour(s)", remHours)
	} else {
		durationStr = "Just checked in (< 1 hour)"
	}

	var totalFood float64
	var pendingCount int
	for _, ord := range roomOrders {
		if ord.Status == domainorder.StatusPending || ord.Status == domainorder.StatusPreparing || ord.Status == domainorder.StatusReady {
			pendingCount++
		}
		totalFood += ord.TotalAmount
	}

	guestName := g.Name
	if guestName == "" {
		guestName = r.CurrentGuestName
	}
	if guestName == "" {
		guestName = "In-House Guest"
	}

	guestPhone := g.Phone
	if guestPhone == "" {
		guestPhone = r.CurrentGuestPhone
	}

	folio := g.FolioBalance
	if folio <= 0 && totalFood > 0 {
		folio = totalFood
	}

	summary := &StaySummary{
		GuestID:           g.ID.Hex(),
		GuestName:         guestName,
		GuestPhone:        guestPhone,
		GuestEmail:        g.Email,
		NumberOfGuests:    g.NumberOfGuests,
		Address:           g.Address,
		Nationality:       g.Nationality,
		IDProofType:       g.IDProofType,
		IDProofURL:        g.IDProofURL,
		RoomID:            r.ID.Hex(),
		RoomNumber:        r.RoomNumber,
		RoomName:          r.Name,
		RoomType:          r.RoomType,
		Floor:             r.Floor,
		Wing:              r.Wing,
		CheckIn:           checkInTime,
		CheckOut:          checkOutTime,
		StayDuration:      durationStr,
		RoomServiceOrders: roomOrders,
		TotalOrders:       len(roomOrders),
		PendingOrders:     pendingCount,
		TotalFoodAmount:   totalFood,
		FolioBalance:      folio,
		SettlementStatus:  "charged_to_folio",
	}

	return summary, nil
}

// CheckOutGuest checks out the active guest, marks room as cleaning, generates stay summary, and creates a housekeeping task.
func (s *Service) CheckOutGuest(ctx context.Context, tenantID bson.ObjectID, identifier string) (*domainroom.Room, *domainroom.HousekeepingTask, *StaySummary, error) {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return nil, nil, nil, err
	}

	roomsColl := s.db.Collection("rooms")
	var r domainroom.Room
	err = roomsColl.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)
	if err != nil {
		return nil, nil, nil, errors.New("room not found")
	}

	// Generate Stay Summary before clearing guest details
	staySummary, _ := s.GetStaySummary(ctx, tenantID, identifier)

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

	// Delete all previous housekeeping tasks for this room
	tasksColl := s.db.Collection("housekeeping_tasks")
	_, _ = tasksColl.DeleteMany(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomId": roomID},
			{"roomNumber": r.RoomNumber},
			{"roomNumber": strings.ToUpper(r.RoomNumber)},
			{"roomNumber": strings.ToLower(r.RoomNumber)},
		},
	})

	// Delete all food orders associated with this checked-out room stay
	ordersColl := s.db.Collection("orders")
	rmNum := r.RoomNumber
	_, _ = ordersColl.DeleteMany(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomId": roomID},
			{"roomNumber": rmNum},
			{"roomNumber": strings.ToUpper(rmNum)},
			{"roomNumber": strings.ToLower(rmNum)},
			{"tableName": rmNum},
			{"tableName": "Suite " + rmNum},
			{"tableName": "Room " + rmNum},
			{"tableSlug": fmt.Sprintf("room-%s", strings.ToLower(rmNum))},
			{"tableSlug": fmt.Sprintf("suite-%s", strings.ToLower(rmNum))},
		},
	})

	// Update room to cleaning and clear current guest
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": roomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"status":                       domainroom.StatusCleaning,
			"currentGuestId":               nil,
			"currentGuestName":             "",
			"currentGuestPhone":            "",
			"currentGuestCheckIn":          nil,
			"currentGuestExpectedCheckOut": nil,
			"doNotDisturb":                 false,
			"updatedAt":                    now,
		},
	}, opts).Decode(&updatedRoom)
	if err != nil {
		return nil, nil, nil, err
	}

	// Create Housekeeping cleaning task
	task := &domainroom.HousekeepingTask{
		ID:             bson.NewObjectID(),
		TenantID:       tenantID,
		RoomID:         roomID,
		RoomNumber:     r.RoomNumber,
		TaskType:       domainroom.TaskCleaning,
		Title:          fmt.Sprintf("Checkout Deep Clean & Linen Refresh — %s", r.Name),
		Priority:       "high",
		Status:         domainroom.TaskPending,
		Notes:          "Guest checked out. Sanitize suite, change linens, replenish minibar and toiletries.",
		Source:         "staff",
		IsGuestRequest: false,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
	_, _ = tasksColl.InsertOne(ctx, task)

	if staySummary != nil {
		staySummary.CheckOut = now
	}

	return &updatedRoom, task, staySummary, nil
}

// ListHousekeepingTasks retrieves housekeeping tasks for a tenant.
func (s *Service) ListHousekeepingTasks(ctx context.Context, tenantID bson.ObjectID, roomIdentifier string, status domainroom.TaskStatus) ([]domainroom.HousekeepingTask, error) {
	coll := s.db.Collection("housekeeping_tasks")
	filter := bson.M{"tenantId": tenantID}

	cleanIdent := strings.TrimSpace(roomIdentifier)
	if cleanIdent != "" && cleanIdent != "all" {
		var matchedRoom domainroom.Room
		var roomOid *bson.ObjectID
		if oid, err := bson.ObjectIDFromHex(cleanIdent); err == nil {
			roomOid = &oid
			_ = s.db.Collection("rooms").FindOne(ctx, bson.M{"_id": oid, "tenantId": tenantID}).Decode(&matchedRoom)
		}

		cleanNum := cleanIdent
		for _, prefix := range []string{"room-", "suite-", "Room-", "Suite-", "room ", "suite "} {
			cleanNum = strings.TrimPrefix(cleanNum, prefix)
		}
		cleanNum = strings.TrimSpace(cleanNum)

		if matchedRoom.ID.IsZero() && cleanNum != "" {
			_ = s.db.Collection("rooms").FindOne(ctx, bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"roomNumber": cleanNum},
					{"roomNumber": strings.ToUpper(cleanNum)},
					{"roomNumber": strings.ToLower(cleanNum)},
					{"qrSlug": fmt.Sprintf("room-%s", strings.ToLower(cleanNum))},
					{"name": bson.M{"$regex": "^(Suite|Room)?[ ]*" + regexp.QuoteMeta(cleanNum) + "$", "$options": "i"}},
				},
			}).Decode(&matchedRoom)
		}

		var orList []bson.M
		if !matchedRoom.ID.IsZero() {
			orList = append(orList,
				bson.M{"roomId": matchedRoom.ID},
				bson.M{"roomNumber": matchedRoom.RoomNumber},
				bson.M{"roomNumber": strings.ToUpper(matchedRoom.RoomNumber)},
				bson.M{"roomNumber": strings.ToLower(matchedRoom.RoomNumber)},
				bson.M{"title": bson.M{"$regex": "(Suite|Room)[ ]*" + regexp.QuoteMeta(matchedRoom.RoomNumber) + "($|[^0-9])", "$options": "i"}},
			)
		}
		if roomOid != nil {
			orList = append(orList, bson.M{"roomId": *roomOid})
		}
		if cleanNum != "" && len(cleanNum) < 20 {
			orList = append(orList,
				bson.M{"roomNumber": cleanNum},
				bson.M{"roomNumber": strings.ToUpper(cleanNum)},
				bson.M{"roomNumber": strings.ToLower(cleanNum)},
				bson.M{"title": bson.M{"$regex": "(Suite|Room)[ ]*" + regexp.QuoteMeta(cleanNum) + "($|[^0-9])", "$options": "i"}},
			)
		}

		if len(orList) > 0 {
			filter["$or"] = orList
		} else {
			filter["roomId"] = bson.NilObjectID
		}

		// When room is occupied, only show tasks created for THIS active guest stay
		if matchedRoom.Status == domainroom.StatusOccupied {
			var checkInTime *time.Time = matchedRoom.CurrentGuestCheckIn
			if checkInTime == nil && matchedRoom.CurrentGuestID != nil && !matchedRoom.CurrentGuestID.IsZero() {
				var g domainroom.Guest
				if err := s.db.Collection("guests").FindOne(ctx, bson.M{"_id": matchedRoom.CurrentGuestID, "tenantId": tenantID}).Decode(&g); err == nil && !g.CheckIn.IsZero() {
					checkInTime = &g.CheckIn
				}
			}
			if checkInTime == nil && !matchedRoom.ID.IsZero() {
				var g domainroom.Guest
				if err := s.db.Collection("guests").FindOne(ctx, bson.M{"roomId": matchedRoom.ID, "status": domainroom.GuestCheckedIn}, options.FindOne().SetSort(bson.D{{Key: "checkIn", Value: -1}})).Decode(&g); err == nil && !g.CheckIn.IsZero() {
					checkInTime = &g.CheckIn
				}
			}
			if checkInTime != nil && !checkInTime.IsZero() {
				filter["createdAt"] = bson.M{"$gte": *checkInTime}
				// Automatically purge any stale tasks created before this guest checked in
				if len(orList) > 0 {
					_, _ = coll.DeleteMany(ctx, bson.M{
						"tenantId":  tenantID,
						"$or":       orList,
						"createdAt": bson.M{"$lt": *checkInTime},
					})
				}
			}
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

// CountActiveTasksForStaff counts active (non-completed) housekeeping tasks assigned to a specific staff member.
func (s *Service) CountActiveTasksForStaff(ctx context.Context, tenantID bson.ObjectID, staffID string, excludeTaskID ...bson.ObjectID) (int64, error) {
	cleanStaffID := strings.TrimSpace(staffID)
	if cleanStaffID == "" {
		return 0, nil
	}
	coll := s.db.Collection("housekeeping_tasks")
	filter := bson.M{
		"tenantId":   tenantID,
		"assignedTo": cleanStaffID,
		"status": bson.M{
			"$in": []domainroom.TaskStatus{
				domainroom.TaskPending,
				domainroom.TaskInProgress,
			},
		},
	}
	if len(excludeTaskID) > 0 && !excludeTaskID[0].IsZero() {
		filter["_id"] = bson.M{"$ne": excludeTaskID[0]}
	}
	return coll.CountDocuments(ctx, filter)
}

// FindAvailableHousekeeper finds an available staff member who currently has 0 active tasks.
// Priority is given to staff with RoleHousekeeping or department Housekeeping, followed by other staff.
func (s *Service) FindAvailableHousekeeper(ctx context.Context, tenantID bson.ObjectID, staffList []domainuser.User) (*domainuser.User, error) {
	if len(staffList) == 0 {
		return nil, nil
	}

	var housekeepers []domainuser.User
	var otherStaff []domainuser.User

	for _, st := range staffList {
		if st.Status != "" && st.Status != domainuser.StatusActive {
			continue
		}
		deptLower := strings.ToLower(st.Department)
		if st.Role == domainuser.RoleHousekeeping || deptLower == "housekeeping" {
			housekeepers = append(housekeepers, st)
		} else if st.Role == domainuser.RoleStaff || st.Role == domainuser.RoleWaiter {
			otherStaff = append(otherStaff, st)
		}
	}

	// 1. Check dedicated housekeepers with 0 active tasks
	for _, hk := range housekeepers {
		count, err := s.CountActiveTasksForStaff(ctx, tenantID, hk.ID.Hex())
		if err != nil {
			continue
		}
		if count == 0 {
			chosen := hk
			return &chosen, nil
		}
	}

	// 2. Fallback to general staff with 0 active tasks
	for _, st := range otherStaff {
		count, err := s.CountActiveTasksForStaff(ctx, tenantID, st.ID.Hex())
		if err != nil {
			continue
		}
		if count == 0 {
			chosen := st
			return &chosen, nil
		}
	}

	// All staff have at least 1 active task: cannot assign to prevent overburdening
	return nil, nil
}

// AssignHousekeepingTask assigns a task to a staff member, strictly enforcing max 1 active task per housekeeper.
func (s *Service) AssignHousekeepingTask(ctx context.Context, tenantID, taskID bson.ObjectID, staffID, staffName string) (*domainroom.HousekeepingTask, error) {
	cleanStaffID := strings.TrimSpace(staffID)
	cleanStaffName := strings.TrimSpace(staffName)

	if cleanStaffID != "" {
		activeCount, err := s.CountActiveTasksForStaff(ctx, tenantID, cleanStaffID, taskID)
		if err != nil {
			return nil, err
		}
		if activeCount >= 1 {
			return nil, errors.New("Housekeeper already has an active task. Two requests cannot go to one housekeeper.")
		}
	}

	coll := s.db.Collection("housekeeping_tasks")
	now := time.Now().UTC()
	update := bson.M{
		"assignedTo":     cleanStaffID,
		"assignedToName": cleanStaffName,
		"updatedAt":      now,
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updated domainroom.HousekeepingTask
	err := coll.FindOneAndUpdate(ctx, bson.M{"_id": taskID, "tenantId": tenantID}, bson.M{"$set": update}, opts).Decode(&updated)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}

// CreateHousekeepingTask creates a task.
func (s *Service) CreateHousekeepingTask(ctx context.Context, t *domainroom.HousekeepingTask) error {
	t.ID = bson.NewObjectID()
	now := time.Now().UTC()
	t.CreatedAt = now
	t.UpdatedAt = now

	if t.AssignedTo != "" {
		count, err := s.CountActiveTasksForStaff(ctx, t.TenantID, t.AssignedTo)
		if err == nil && count >= 1 {
			return errors.New("Housekeeper already has an active task. Two requests cannot go to one housekeeper.")
		}
	}

	if err := t.Validate(); err != nil {
		return err
	}

	coll := s.db.Collection("housekeeping_tasks")
	_, err := coll.InsertOne(ctx, t)
	return err
}

// UpdateHousekeepingTask updates status of a task; if cleaning is completed, room returns to vacant.
func (s *Service) UpdateHousekeepingTask(ctx context.Context, tenantID bson.ObjectID, taskID bson.ObjectID, status domainroom.TaskStatus, notes string, optAssign ...string) (*domainroom.HousekeepingTask, error) {
	coll := s.db.Collection("housekeeping_tasks")
	now := time.Now().UTC()

	update := bson.M{
		"updatedAt": now,
	}
	if status != "" {
		update["status"] = status
	}
	if notes != "" {
		update["notes"] = notes
	}
	if status == domainroom.TaskCompleted {
		update["completedAt"] = now
	}

	if len(optAssign) > 0 && strings.TrimSpace(optAssign[0]) != "" {
		newStaffID := strings.TrimSpace(optAssign[0])
		activeCount, err := s.CountActiveTasksForStaff(ctx, tenantID, newStaffID, taskID)
		if err != nil {
			return nil, err
		}
		if activeCount >= 1 {
			return nil, errors.New("Housekeeper already has an active task. Two requests cannot go to one housekeeper.")
		}
		update["assignedTo"] = newStaffID
		if len(optAssign) > 1 && strings.TrimSpace(optAssign[1]) != "" {
			update["assignedToName"] = strings.TrimSpace(optAssign[1])
		}
	}

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updated domainroom.HousekeepingTask
	err := coll.FindOneAndUpdate(ctx, bson.M{"_id": taskID, "tenantId": tenantID}, bson.M{"$set": update}, opts).Decode(&updated)
	if err != nil {
		return nil, err
	}

	// If task is completed, check if room has DND active
	if status == domainroom.TaskCompleted {
		roomsColl := s.db.Collection("rooms")
		var r domainroom.Room
		if err := roomsColl.FindOne(ctx, bson.M{"_id": updated.RoomID, "tenantId": tenantID}).Decode(&r); err == nil {
			if r.DoNotDisturb {
				return nil, errors.New("cannot mark room service-ready while Do Not Disturb (DND) is active")
			}
			if updated.TaskType == domainroom.TaskCleaning && r.Status == domainroom.StatusCleaning {
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
func (s *Service) GetRoomOrders(ctx context.Context, tenantID bson.ObjectID, idOrNumber string, optRoomNum ...string) ([]domainorder.Order, error) {
	ordersColl := s.db.Collection("orders")
	rClean := strings.TrimSpace(idOrNumber)
	if rClean == "" && len(optRoomNum) > 0 {
		rClean = strings.TrimSpace(optRoomNum[0])
	}
	if rClean == "" {
		return []domainorder.Order{}, nil
	}

	cleanNum := rClean
	for _, prefix := range []string{"room-", "suite-", "Room-", "Suite-", "room ", "suite ", "Room ", "Suite "} {
		cleanNum = strings.TrimPrefix(cleanNum, prefix)
	}
	cleanNum = strings.TrimSpace(cleanNum)

	var extraRoomNum string
	if len(optRoomNum) > 0 && strings.TrimSpace(optRoomNum[0]) != "" {
		extraRoomNum = strings.TrimSpace(optRoomNum[0])
		for _, prefix := range []string{"room-", "suite-", "Room-", "Suite-", "room ", "suite ", "Room ", "Suite "} {
			extraRoomNum = strings.TrimPrefix(extraRoomNum, prefix)
		}
		extraRoomNum = strings.TrimSpace(extraRoomNum)
	}

	var matchedRoom domainroom.Room
	roomsColl := s.db.Collection("rooms")

	var roomOid *bson.ObjectID
	if oid, err := bson.ObjectIDFromHex(rClean); err == nil {
		roomOid = &oid
		_ = roomsColl.FindOne(ctx, bson.M{"_id": oid, "tenantId": tenantID}).Decode(&matchedRoom)
	}

	if matchedRoom.ID.IsZero() {
		candidateNums := []string{cleanNum}
		if extraRoomNum != "" && extraRoomNum != cleanNum {
			candidateNums = append(candidateNums, extraRoomNum)
		}
		for _, num := range candidateNums {
			if num == "" {
				continue
			}
			err := roomsColl.FindOne(ctx, bson.M{
				"tenantId": tenantID,
				"$or": []bson.M{
					{"roomNumber": num},
					{"roomNumber": strings.ToUpper(num)},
					{"roomNumber": strings.ToLower(num)},
					{"qrSlug": fmt.Sprintf("room-%s", strings.ToLower(num))},
					{"qrSlug": strings.ToLower(num)},
					{"name": bson.M{"$regex": "^(Suite|Room)?[ ]*" + regexp.QuoteMeta(num) + "$", "$options": "i"}},
				},
			}).Decode(&matchedRoom)
			if err == nil {
				break
			}
		}
	}

	if matchedRoom.ID.IsZero() && roomOid != nil {
		_ = roomsColl.FindOne(ctx, bson.M{"_id": *roomOid}).Decode(&matchedRoom)
	}

	var orClauses []bson.M

	// 1. Matched room document
	if !matchedRoom.ID.IsZero() {
		rmNum := matchedRoom.RoomNumber
		orClauses = append(orClauses,
			bson.M{"roomId": matchedRoom.ID},
			bson.M{"roomNumber": rmNum},
			bson.M{"roomNumber": strings.ToUpper(rmNum)},
			bson.M{"roomNumber": strings.ToLower(rmNum)},
			bson.M{"tableName": bson.M{"$regex": rmNum, "$options": "i"}},
			bson.M{"tableName": bson.M{"$regex": "Suite[ ]*" + regexp.QuoteMeta(rmNum), "$options": "i"}},
			bson.M{"tableName": bson.M{"$regex": "Room[ ]*" + regexp.QuoteMeta(rmNum), "$options": "i"}},
			bson.M{"tableSlug": fmt.Sprintf("room-%s", strings.ToLower(rmNum))},
			bson.M{"tableSlug": fmt.Sprintf("suite-%s", strings.ToLower(rmNum))},
		)
	}

	// 2. Parsed ObjectID
	if roomOid != nil {
		orClauses = append(orClauses, bson.M{"roomId": *roomOid})
	}

	// 3. Parsed candidate room numbers
	numsToMatch := []string{}
	if cleanNum != "" && len(cleanNum) < 20 {
		numsToMatch = append(numsToMatch, cleanNum)
	}
	if extraRoomNum != "" && extraRoomNum != cleanNum {
		numsToMatch = append(numsToMatch, extraRoomNum)
	}

	for _, num := range numsToMatch {
		orClauses = append(orClauses,
			bson.M{"roomNumber": num},
			bson.M{"roomNumber": strings.ToUpper(num)},
			bson.M{"roomNumber": strings.ToLower(num)},
			bson.M{"tableName": bson.M{"$regex": num, "$options": "i"}},
			bson.M{"tableName": bson.M{"$regex": "Suite[ ]*" + regexp.QuoteMeta(num), "$options": "i"}},
			bson.M{"tableName": bson.M{"$regex": "Room[ ]*" + regexp.QuoteMeta(num), "$options": "i"}},
			bson.M{"tableSlug": fmt.Sprintf("room-%s", strings.ToLower(num))},
			bson.M{"tableSlug": fmt.Sprintf("suite-%s", strings.ToLower(num))},
		)
	}

	if len(orClauses) == 0 {
		return []domainorder.Order{}, nil
	}

	filter := bson.M{
		"tenantId": tenantID,
		"$or":      orClauses,
	}

	// When room is occupied, only show orders placed during THIS active guest stay
	if matchedRoom.Status == domainroom.StatusOccupied {
		var checkInTime *time.Time = matchedRoom.CurrentGuestCheckIn
		if checkInTime == nil && matchedRoom.CurrentGuestID != nil && !matchedRoom.CurrentGuestID.IsZero() {
			var g domainroom.Guest
			if err := s.db.Collection("guests").FindOne(ctx, bson.M{"_id": matchedRoom.CurrentGuestID, "tenantId": tenantID}).Decode(&g); err == nil && !g.CheckIn.IsZero() {
				checkInTime = &g.CheckIn
			}
		}
		if checkInTime == nil && !matchedRoom.ID.IsZero() {
			var g domainroom.Guest
			if err := s.db.Collection("guests").FindOne(ctx, bson.M{"roomId": matchedRoom.ID, "status": domainroom.GuestCheckedIn}, options.FindOne().SetSort(bson.D{{Key: "checkIn", Value: -1}})).Decode(&g); err == nil && !g.CheckIn.IsZero() {
				checkInTime = &g.CheckIn
			}
		}
		if checkInTime != nil && !checkInTime.IsZero() {
			filter["createdAt"] = bson.M{"$gte": *checkInTime}
			// Automatically purge any stale room service orders created before this guest checked in
			if len(orClauses) > 0 {
				_, _ = ordersColl.DeleteMany(ctx, bson.M{
					"tenantId":  tenantID,
					"$or":       orClauses,
					"createdAt": bson.M{"$lt": *checkInTime},
				})
			}
		}
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(100)
	cursor, err := ordersColl.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var orders []domainorder.Order
	if err := cursor.All(ctx, &orders); err != nil {
		return nil, err
	}
	if orders == nil {
		orders = []domainorder.Order{}
	}
	return orders, nil
}

// ClearRoomHistory purges all past housekeeping tasks and room food orders for a room.
func (s *Service) ClearRoomHistory(ctx context.Context, tenantID bson.ObjectID, identifier string) error {
	roomID, err := s.ResolveRoomID(ctx, tenantID, identifier)
	if err != nil {
		return err
	}

	roomsColl := s.db.Collection("rooms")
	var r domainroom.Room
	_ = roomsColl.FindOne(ctx, bson.M{"_id": roomID, "tenantId": tenantID}).Decode(&r)

	rmNum := r.RoomNumber
	tasksColl := s.db.Collection("housekeeping_tasks")
	_, _ = tasksColl.DeleteMany(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomId": roomID},
			{"roomNumber": rmNum},
			{"roomNumber": strings.ToUpper(rmNum)},
			{"roomNumber": strings.ToLower(rmNum)},
		},
	})

	ordersColl := s.db.Collection("orders")
	_, _ = ordersColl.DeleteMany(ctx, bson.M{
		"tenantId": tenantID,
		"$or": []bson.M{
			{"roomId": roomID},
			{"roomNumber": rmNum},
			{"roomNumber": strings.ToUpper(rmNum)},
			{"roomNumber": strings.ToLower(rmNum)},
			{"tableName": rmNum},
			{"tableName": "Suite " + rmNum},
			{"tableName": "Room " + rmNum},
			{"tableSlug": fmt.Sprintf("room-%s", strings.ToLower(rmNum))},
			{"tableSlug": fmt.Sprintf("suite-%s", strings.ToLower(rmNum))},
		},
	})

	return nil
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
	filter := bson.M{
		"$or": []bson.M{
			{"slug": slugClean},
			{"slug": strings.ToLower(slugClean)},
		},
	}
	if oid, err := bson.ObjectIDFromHex(slugClean); err == nil {
		filter["$or"] = append(filter["$or"].([]bson.M), bson.M{"_id": oid})
	}

	err := tenantsColl.FindOne(ctx, filter).Decode(&t)
	if err == mongo.ErrNoDocuments && (strings.EqualFold(slugClean, "dineflow") || strings.EqualFold(slugClean, "restaurant") || strings.EqualFold(slugClean, "hotel") || strings.EqualFold(slugClean, "demo")) {
		err = tenantsColl.FindOne(ctx, bson.M{"slug": "the-grand-bistro"}).Decode(&t)
	}
	if err == mongo.ErrNoDocuments {
		err = tenantsColl.FindOne(ctx, bson.M{"status": "active"}).Decode(&t)
	}
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

// ExtendPublicGuestStay extends an in-house guest's stay from the customer portal.
// It strictly enforces that the stay can only be INCREASED (new checkout > current checkout).
func (s *Service) ExtendPublicGuestStay(ctx context.Context, tenantSlug, roomIdentifier string, newCheckOut time.Time, notes string) (*domainroom.Guest, *domainroom.Room, int, time.Time, error) {
	if newCheckOut.IsZero() {
		return nil, nil, 0, time.Time{}, errors.New("a valid new check-out date is required")
	}

	room, _, err := s.GetPublicRoom(ctx, tenantSlug, roomIdentifier)
	if err != nil {
		return nil, nil, 0, time.Time{}, err
	}

	guestsColl := s.db.Collection("guests")
	var g domainroom.Guest
	if room.CurrentGuestID != nil && !room.CurrentGuestID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{"_id": *room.CurrentGuestID, "tenantId": room.TenantID}).Decode(&g)
	}
	if g.ID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{
			"roomId":   room.ID,
			"tenantId": room.TenantID,
			"status":   domainroom.GuestCheckedIn,
		}, options.FindOne().SetSort(bson.D{{Key: "checkIn", Value: -1}})).Decode(&g)
	}

	nowTime := time.Now().UTC()
	if g.ID.IsZero() {
		// Initialize in-house guest record if suite is actively scanned
		guestName := strings.TrimSpace(room.CurrentGuestName)
		if guestName == "" {
			guestName = fmt.Sprintf("Guest of %s", room.Name)
		}
		checkInTime := nowTime.Add(-24 * time.Hour)
		if room.CurrentGuestCheckIn != nil && !room.CurrentGuestCheckIn.IsZero() {
			checkInTime = *room.CurrentGuestCheckIn
		}
		defaultCheckout := time.Date(nowTime.Year(), nowTime.Month(), nowTime.Day(), 11, 0, 0, 0, time.UTC)
		if !defaultCheckout.After(checkInTime) {
			defaultCheckout = defaultCheckout.Add(24 * time.Hour)
		}

		g = domainroom.Guest{
			ID:               bson.NewObjectID(),
			TenantID:         room.TenantID,
			RoomID:           room.ID,
			RoomNumber:       room.RoomNumber,
			Name:             guestName,
			Status:           domainroom.GuestCheckedIn,
			CheckIn:          checkInTime,
			ExpectedCheckOut: &defaultCheckout,
			NumberOfGuests:   2,
			CreatedAt:        nowTime,
			UpdatedAt:        nowTime,
		}
		_, _ = guestsColl.InsertOne(ctx, g)
		room.CurrentGuestID = &g.ID
		room.CurrentGuestName = guestName
		room.Status = domainroom.StatusOccupied
		room.CurrentGuestCheckIn = &checkInTime
		room.CurrentGuestExpectedCheckOut = &defaultCheckout
	}

	// Determine baseline current check-out date
	currentCheckOut := time.Date(nowTime.Year(), nowTime.Month(), nowTime.Day(), 11, 0, 0, 0, time.UTC)
	if g.ExpectedCheckOut != nil && !g.ExpectedCheckOut.IsZero() {
		currentCheckOut = *g.ExpectedCheckOut
	} else if room.CurrentGuestExpectedCheckOut != nil && !room.CurrentGuestExpectedCheckOut.IsZero() {
		currentCheckOut = *room.CurrentGuestExpectedCheckOut
	} else if !g.CheckIn.IsZero() {
		currentCheckOut = g.CheckIn.Add(24 * time.Hour)
	}

	// STRICT VALIDATION: Customer can ONLY increase/extend stay, NEVER decrease or shorten
	if !newCheckOut.After(currentCheckOut) {
		return nil, nil, 0, currentCheckOut, fmt.Errorf("check-out date can only be extended to a later date (current check-out is %s). Stays cannot be shortened from the customer portal", currentCheckOut.Format("02 Jan 2006, 03:04 PM"))
	}

	// Calculate additional nights
	diff := newCheckOut.Sub(currentCheckOut)
	additionalNights := int(math.Max(1, math.Round(diff.Hours()/24)))

	now := time.Now().UTC()
	guestUpdate := bson.M{
		"expectedCheckOut": newCheckOut,
		"updatedAt":        now,
	}

	trimmedNotes := strings.TrimSpace(notes)
	if trimmedNotes != "" {
		extNote := fmt.Sprintf("[%s] Guest extended stay (+%d nights): %s", now.Format("02 Jan 15:04"), additionalNights, trimmedNotes)
		if g.SpecialRequests != "" {
			guestUpdate["specialRequests"] = g.SpecialRequests + " | " + extNote
		} else {
			guestUpdate["specialRequests"] = extNote
		}
	}

	_, err = guestsColl.UpdateOne(ctx, bson.M{"_id": g.ID, "tenantId": room.TenantID}, bson.M{"$set": guestUpdate})
	if err != nil {
		return nil, nil, 0, currentCheckOut, fmt.Errorf("failed to update guest stay: %w", err)
	}
	g.ExpectedCheckOut = &newCheckOut

	roomsColl := s.db.Collection("rooms")
	roomUpdate := bson.M{
		"currentGuestExpectedCheckOut": newCheckOut,
		"updatedAt":                    now,
	}
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	err = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": room.ID, "tenantId": room.TenantID}, bson.M{"$set": roomUpdate}, opts).Decode(&updatedRoom)
	if err != nil {
		updatedRoom = *room
		updatedRoom.CurrentGuestExpectedCheckOut = &newCheckOut
	}

	return &g, &updatedRoom, additionalNights, currentCheckOut, nil
}

// CreateStayExtensionRequest creates a formal guest stay extension request requiring hotel approval.
func (s *Service) CreateStayExtensionRequest(ctx context.Context, tenantSlug, roomIdentifier string, requestedCheckout time.Time, notes string) (*domainroom.StayExtensionRequest, *domainroom.Room, *domainroom.Guest, error) {
	if requestedCheckout.IsZero() {
		return nil, nil, nil, errors.New("a valid requested check-out date is required")
	}

	room, _, err := s.GetPublicRoom(ctx, tenantSlug, roomIdentifier)
	if err != nil {
		return nil, nil, nil, err
	}

	guestsColl := s.db.Collection("guests")
	var g domainroom.Guest
	if room.CurrentGuestID != nil && !room.CurrentGuestID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{"_id": *room.CurrentGuestID, "tenantId": room.TenantID}).Decode(&g)
	}
	if g.ID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{
			"roomId":   room.ID,
			"tenantId": room.TenantID,
			"status":   domainroom.GuestCheckedIn,
		}, options.FindOne().SetSort(bson.D{{Key: "checkIn", Value: -1}})).Decode(&g)
	}

	nowTime := time.Now().UTC()
	if g.ID.IsZero() {
		guestName := strings.TrimSpace(room.CurrentGuestName)
		if guestName == "" {
			guestName = fmt.Sprintf("Guest of %s", room.Name)
		}
		checkInTime := nowTime.Add(-24 * time.Hour)
		if room.CurrentGuestCheckIn != nil && !room.CurrentGuestCheckIn.IsZero() {
			checkInTime = *room.CurrentGuestCheckIn
		}
		defaultCheckout := time.Date(nowTime.Year(), nowTime.Month(), nowTime.Day(), 11, 0, 0, 0, time.UTC)
		if !defaultCheckout.After(checkInTime) {
			defaultCheckout = defaultCheckout.Add(24 * time.Hour)
		}

		g = domainroom.Guest{
			ID:               bson.NewObjectID(),
			TenantID:         room.TenantID,
			RoomID:           room.ID,
			RoomNumber:       room.RoomNumber,
			Name:             guestName,
			Status:           domainroom.GuestCheckedIn,
			CheckIn:          checkInTime,
			ExpectedCheckOut: &defaultCheckout,
			NumberOfGuests:   2,
			CreatedAt:        nowTime,
			UpdatedAt:        nowTime,
		}
		_, _ = guestsColl.InsertOne(ctx, g)
		room.CurrentGuestID = &g.ID
		room.CurrentGuestName = guestName
		room.Status = domainroom.StatusOccupied
		room.CurrentGuestCheckIn = &checkInTime
		room.CurrentGuestExpectedCheckOut = &defaultCheckout
	}

	// Current checkout baseline
	currentCheckout := time.Date(nowTime.Year(), nowTime.Month(), nowTime.Day(), 11, 0, 0, 0, time.UTC)
	if g.ExpectedCheckOut != nil && !g.ExpectedCheckOut.IsZero() {
		currentCheckout = *g.ExpectedCheckOut
	} else if room.CurrentGuestExpectedCheckOut != nil && !room.CurrentGuestExpectedCheckOut.IsZero() {
		currentCheckout = *room.CurrentGuestExpectedCheckOut
	} else if !g.CheckIn.IsZero() {
		currentCheckout = g.CheckIn.Add(24 * time.Hour)
	}

	// Validation: stay can only be extended forward
	if !requestedCheckout.After(currentCheckout) {
		return nil, nil, nil, fmt.Errorf("requested check-out date must be later than current check-out (%s)", currentCheckout.Format("02 Jan 2006, 03:04 PM"))
	}

	diff := requestedCheckout.Sub(currentCheckout)
	additionalNights := int(math.Max(1, math.Round(diff.Hours()/24)))

	requestsColl := s.db.Collection("stay_extension_requests")

	// Generate friendly ID: EXT-YYYYMMDD-XXXX
	reqID := fmt.Sprintf("EXT-%s-%04d", nowTime.Format("20060102"), nowTime.UnixNano()%10000)

	extReq := &domainroom.StayExtensionRequest{
		ID:                bson.NewObjectID(),
		RequestID:         reqID,
		TenantID:          room.TenantID,
		BookingID:         &g.ID,
		RoomID:            room.ID,
		RoomNumber:        room.RoomNumber,
		GuestID:           &g.ID,
		GuestName:         g.Name,
		CurrentCheckout:   currentCheckout,
		RequestedCheckout: requestedCheckout,
		AdditionalNights:  additionalNights,
		Status:            domainroom.ExtensionPending,
		Reason:            strings.TrimSpace(notes),
		CreatedAt:         nowTime,
		UpdatedAt:         nowTime,
	}

	if err := extReq.Validate(); err != nil {
		return nil, nil, nil, err
	}

	_, err = requestsColl.InsertOne(ctx, extReq)
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to submit extension request: %w", err)
	}

	return extReq, room, &g, nil
}

// GetPublicStayExtensionStatus retrieves active stay extension request for a room.
func (s *Service) GetPublicStayExtensionStatus(ctx context.Context, tenantSlug, roomIdentifier string) (*domainroom.StayExtensionRequest, error) {
	room, _, err := s.GetPublicRoom(ctx, tenantSlug, roomIdentifier)
	if err != nil {
		return nil, err
	}

	requestsColl := s.db.Collection("stay_extension_requests")
	var ext domainroom.StayExtensionRequest
	// Find the most recent request for this room
	opts := options.FindOne().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	err = requestsColl.FindOne(ctx, bson.M{
		"tenantId": room.TenantID,
		"roomId":   room.ID,
	}, opts).Decode(&ext)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, err
	}

	return &ext, nil
}

// ListStayExtensionRequests retrieves extension requests for tenant management.
func (s *Service) ListStayExtensionRequests(ctx context.Context, tenantID bson.ObjectID, status string) ([]domainroom.StayExtensionRequest, error) {
	requestsColl := s.db.Collection("stay_extension_requests")
	filter := bson.M{"tenantId": tenantID}
	if strings.TrimSpace(status) != "" && status != "all" {
		filter["status"] = status
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}})
	cursor, err := requestsColl.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domainroom.StayExtensionRequest
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domainroom.StayExtensionRequest{}
	}
	return list, nil
}

// ApproveStayExtensionRequest approves a pending extension and updates the guest booking & room checkout.
func (s *Service) ApproveStayExtensionRequest(ctx context.Context, tenantID bson.ObjectID, requestIdentifier string, managerName string, comment string) (*domainroom.StayExtensionRequest, *domainroom.Room, *domainroom.Guest, error) {
	requestsColl := s.db.Collection("stay_extension_requests")

	var filter bson.M
	if oid, err := bson.ObjectIDFromHex(requestIdentifier); err == nil {
		filter = bson.M{"_id": oid, "tenantId": tenantID}
	} else {
		filter = bson.M{"requestId": requestIdentifier, "tenantId": tenantID}
	}

	var extReq domainroom.StayExtensionRequest
	if err := requestsColl.FindOne(ctx, filter).Decode(&extReq); err != nil {
		return nil, nil, nil, errors.New("extension request not found")
	}

	if extReq.Status != domainroom.ExtensionPending {
		return nil, nil, nil, fmt.Errorf("request already %s", extReq.Status)
	}

	now := time.Now().UTC()
	if managerName == "" {
		managerName = "Manager"
	}

	// 1. Update stay_extension_requests
	extReq.Status = domainroom.ExtensionApproved
	extReq.ApprovedBy = managerName
	extReq.ApprovedAt = &now
	extReq.ManagerComment = strings.TrimSpace(comment)
	extReq.UpdatedAt = now

	_, err := requestsColl.UpdateOne(ctx, bson.M{"_id": extReq.ID}, bson.M{
		"$set": bson.M{
			"status":         domainroom.ExtensionApproved,
			"approvedBy":     managerName,
			"approvedAt":     now,
			"managerComment": extReq.ManagerComment,
			"updatedAt":      now,
		},
	})
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to update request status: %w", err)
	}

	// 2. Update guest booking checkout date
	guestsColl := s.db.Collection("guests")
	var g domainroom.Guest
	if extReq.BookingID != nil && !extReq.BookingID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{"_id": *extReq.BookingID, "tenantId": tenantID}).Decode(&g)
	}
	if g.ID.IsZero() && extReq.GuestID != nil && !extReq.GuestID.IsZero() {
		_ = guestsColl.FindOne(ctx, bson.M{"_id": *extReq.GuestID, "tenantId": tenantID}).Decode(&g)
	}
	if !g.ID.IsZero() {
		_, _ = guestsColl.UpdateOne(ctx, bson.M{"_id": g.ID}, bson.M{
			"$set": bson.M{
				"expectedCheckOut": extReq.RequestedCheckout,
				"updatedAt":        now,
			},
		})
		g.ExpectedCheckOut = &extReq.RequestedCheckout
	}

	// 3. Update room current guest expected checkout date
	roomsColl := s.db.Collection("rooms")
	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var updatedRoom domainroom.Room
	_ = roomsColl.FindOneAndUpdate(ctx, bson.M{"_id": extReq.RoomID, "tenantId": tenantID}, bson.M{
		"$set": bson.M{
			"currentGuestExpectedCheckOut": extReq.RequestedCheckout,
			"updatedAt":                    now,
		},
	}, opts).Decode(&updatedRoom)

	return &extReq, &updatedRoom, &g, nil
}

// RejectStayExtensionRequest declines a pending extension with a reason. Booking remains unchanged.
func (s *Service) RejectStayExtensionRequest(ctx context.Context, tenantID bson.ObjectID, requestIdentifier string, managerName string, reason string) (*domainroom.StayExtensionRequest, *domainroom.Room, *domainroom.Guest, error) {
	requestsColl := s.db.Collection("stay_extension_requests")

	var filter bson.M
	if oid, err := bson.ObjectIDFromHex(requestIdentifier); err == nil {
		filter = bson.M{"_id": oid, "tenantId": tenantID}
	} else {
		filter = bson.M{"requestId": requestIdentifier, "tenantId": tenantID}
	}

	var extReq domainroom.StayExtensionRequest
	if err := requestsColl.FindOne(ctx, filter).Decode(&extReq); err != nil {
		return nil, nil, nil, errors.New("extension request not found")
	}

	if extReq.Status != domainroom.ExtensionPending {
		return nil, nil, nil, fmt.Errorf("request already %s", extReq.Status)
	}

	now := time.Now().UTC()
	if managerName == "" {
		managerName = "Manager"
	}
	trimmedReason := strings.TrimSpace(reason)
	if trimmedReason == "" {
		trimmedReason = "Room is fully booked for subsequent dates."
	}

	extReq.Status = domainroom.ExtensionRejected
	extReq.ApprovedBy = managerName
	extReq.Reason = trimmedReason
	extReq.ManagerComment = trimmedReason
	extReq.UpdatedAt = now

	_, err := requestsColl.UpdateOne(ctx, bson.M{"_id": extReq.ID}, bson.M{
		"$set": bson.M{
			"status":         domainroom.ExtensionRejected,
			"approvedBy":     managerName,
			"reason":         trimmedReason,
			"managerComment": trimmedReason,
			"updatedAt":      now,
		},
	})
	if err != nil {
		return nil, nil, nil, fmt.Errorf("failed to update request status: %w", err)
	}

	var r domainroom.Room
	_ = s.db.Collection("rooms").FindOne(ctx, bson.M{"_id": extReq.RoomID, "tenantId": tenantID}).Decode(&r)

	var g domainroom.Guest
	if extReq.BookingID != nil && !extReq.BookingID.IsZero() {
		_ = s.db.Collection("guests").FindOne(ctx, bson.M{"_id": *extReq.BookingID, "tenantId": tenantID}).Decode(&g)
	}

	return &extReq, &r, &g, nil
}

// ListGuestHistory returns all hotel guest check-in records for a tenant, optionally filtered by date range.
func (s *Service) ListGuestHistory(ctx context.Context, tenantID bson.ObjectID, startDate, endDate *time.Time) ([]domainroom.Guest, error) {
	guestsColl := s.db.Collection("guests")

	filter := bson.M{"tenantId": tenantID}

	if startDate != nil || endDate != nil {
		dateFilter := bson.M{}
		if startDate != nil {
			dateFilter["$gte"] = *startDate
		}
		if endDate != nil {
			dateFilter["$lte"] = *endDate
		}
		filter["checkIn"] = dateFilter
	}

	opts := options.Find().SetSort(bson.D{{Key: "checkIn", Value: -1}})
	cursor, err := guestsColl.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var guests []domainroom.Guest
	if err := cursor.All(ctx, &guests); err != nil {
		return nil, err
	}
	if guests == nil {
		guests = []domainroom.Guest{}
	}
	return guests, nil
}

