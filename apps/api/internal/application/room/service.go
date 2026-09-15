package room

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	domainorder "github.com/dineflow/api/internal/domain/order"
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
	checkInTime := now
	if input.CheckIn != nil && !input.CheckIn.IsZero() {
		checkInTime = *input.CheckIn
	}

	numGuests := input.NumberOfGuests
	if numGuests <= 0 {
		numGuests = 1
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
		return nil, nil, nil, err
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
