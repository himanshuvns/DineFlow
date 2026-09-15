package room

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type RoomStatus string

const (
	StatusVacant       RoomStatus = "vacant"
	StatusOccupied     RoomStatus = "occupied"
	StatusReserved     RoomStatus = "reserved"
	StatusCleaning     RoomStatus = "cleaning"
	StatusMaintenance  RoomStatus = "maintenance"
	StatusOutOfService RoomStatus = "out_of_service"
)

type GuestStatus string

const (
	GuestCheckedIn  GuestStatus = "checked_in"
	GuestCheckedOut GuestStatus = "checked_out"
)

type TaskType string

const (
	TaskCleaning       TaskType = "cleaning"
	TaskLinenChange    TaskType = "linen_change"
	TaskMaintenance    TaskType = "maintenance"
	TaskInspection     TaskType = "inspection"
	TaskAmenityRequest TaskType = "amenity_request"
)

type TaskStatus string

const (
	TaskPending    TaskStatus = "pending"
	TaskInProgress TaskStatus = "in_progress"
	TaskCompleted  TaskStatus = "completed"
)

// Room represents a guest room or luxury suite in a hotel.
type Room struct {
	ID                bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID          bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	RoomNumber        string         `bson:"roomNumber" json:"roomNumber"`
	Name              string         `bson:"name" json:"name"`
	RoomType          string         `bson:"roomType" json:"roomType"` // "deluxe", "executive", "suite", "penthouse", "cabana", "room"
	Floor             string         `bson:"floor" json:"floor"`
	Wing              string         `bson:"wing" json:"wing"`
	Capacity          int            `bson:"capacity" json:"capacity"`
	Status            RoomStatus     `bson:"status" json:"status"`
	DoNotDisturb      bool           `bson:"doNotDisturb" json:"doNotDisturb"`
	FolioEnabled      bool           `bson:"folioEnabled" json:"folioEnabled"`
	CurrentGuestID      *bson.ObjectID `bson:"currentGuestId,omitempty" json:"currentGuestId,omitempty"`
	CurrentGuestName             string         `bson:"currentGuestName,omitempty" json:"currentGuestName,omitempty"`
	CurrentGuestPhone            string         `bson:"currentGuestPhone,omitempty" json:"currentGuestPhone,omitempty"`
	CurrentGuestCheckIn          *time.Time     `bson:"currentGuestCheckIn,omitempty" json:"currentGuestCheckIn,omitempty"`
	CurrentGuestExpectedCheckOut *time.Time     `bson:"currentGuestExpectedCheckOut,omitempty" json:"currentGuestExpectedCheckOut,omitempty"`
	CurrentGuest                 *Guest         `bson:"-" json:"currentGuest,omitempty"`
	QRSlug                       string         `bson:"qrSlug" json:"qrSlug"`
	Amenities                    []string       `bson:"amenities" json:"amenities"`
	Images                       []string       `bson:"images,omitempty" json:"images,omitempty"`
	CreatedAt                    time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt                    time.Time      `bson:"updatedAt" json:"updatedAt"`
}

func (r *Room) Validate() error {
	if strings.TrimSpace(r.RoomNumber) == "" {
		return errors.New("roomNumber is required")
	}
	if r.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if strings.TrimSpace(r.Name) == "" {
		r.Name = fmt.Sprintf("Room %s", r.RoomNumber)
	}
	if r.Capacity <= 0 {
		r.Capacity = 2
	}
	if r.RoomType == "" {
		r.RoomType = "room"
	}
	if r.Status == "" {
		r.Status = StatusVacant
	}
	if r.QRSlug == "" {
		r.QRSlug = fmt.Sprintf("room-%s", strings.ToLower(r.RoomNumber))
	}
	return nil
}

// Guest represents an in-house or historical guest checked into a room.
type Guest struct {
	ID                bson.ObjectID  `bson:"_id,omitempty" json:"id"`
	TenantID          bson.ObjectID  `bson:"tenantId" json:"tenantId"`
	RoomID            bson.ObjectID  `bson:"roomId" json:"roomId"`
	RoomNumber        string         `bson:"roomNumber" json:"roomNumber"`
	Name              string         `bson:"name" json:"name"`
	Phone             string         `bson:"phone" json:"phone"`
	Email             string         `bson:"email,omitempty" json:"email,omitempty"`
	NumberOfGuests    int            `bson:"numberOfGuests,omitempty" json:"numberOfGuests,omitempty"`
	CheckIn           time.Time      `bson:"checkIn" json:"checkIn"`
	ExpectedCheckOut  *time.Time     `bson:"expectedCheckOut,omitempty" json:"expectedCheckOut,omitempty"`
	CheckOut          *time.Time     `bson:"checkOut,omitempty" json:"checkOut,omitempty"`
	Status            GuestStatus    `bson:"status" json:"status"`
	Address           string         `bson:"address,omitempty" json:"address,omitempty"`
	Nationality       string         `bson:"nationality,omitempty" json:"nationality,omitempty"`
	IDProofType       string         `bson:"idProofType,omitempty" json:"idProofType,omitempty"` // "Aadhaar Card", "Driving License", "Passport", "Voter ID", "PAN Card"
	IDProofURL        string         `bson:"idProofUrl,omitempty" json:"idProofUrl,omitempty"`
	IDProofUploadedAt *time.Time     `bson:"idProofUploadedAt,omitempty" json:"idProofUploadedAt,omitempty"`
	SpecialRequests   string         `bson:"specialRequests,omitempty" json:"specialRequests,omitempty"`
	FolioBalance      float64        `bson:"folioBalance" json:"folioBalance"`
	CreatedAt         time.Time      `bson:"createdAt" json:"createdAt"`
	UpdatedAt         time.Time      `bson:"updatedAt" json:"updatedAt"`
}

// ValidateAndNormalizeIndianPhone validates an Indian mobile number and normalizes to E.164 (+91XXXXXXXXXX).
func ValidateAndNormalizeIndianPhone(phone string) (string, error) {
	trimmed := strings.TrimSpace(phone)
	if trimmed == "" {
		return "", errors.New("mobile number is required")
	}

	// Remove spaces, hyphens, parentheses
	cleaned := strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' || r == '+' {
			return r
		}
		return -1
	}, trimmed)

	var digits string
	if strings.HasPrefix(cleaned, "+91") {
		digits = cleaned[3:]
	} else if strings.HasPrefix(cleaned, "91") && len(cleaned) == 12 {
		digits = cleaned[2:]
	} else if strings.HasPrefix(cleaned, "0") && len(cleaned) == 11 {
		digits = cleaned[1:]
	} else if !strings.HasPrefix(cleaned, "+") {
		digits = cleaned
	} else {
		return "", errors.New("invalid country code: only Indian numbers (+91) supported")
	}

	if len(digits) < 10 {
		return "", fmt.Errorf("phone number is too short (%d/10 digits)", len(digits))
	}
	if len(digits) > 10 {
		return "", fmt.Errorf("phone number exceeds 10 digits (%d digits)", len(digits))
	}

	firstDigit := digits[0]
	if firstDigit != '6' && firstDigit != '7' && firstDigit != '8' && firstDigit != '9' {
		return "", errors.New("invalid Indian mobile number: must start with 6, 7, 8, or 9")
	}

	return "+91" + digits, nil
}

func (g *Guest) Validate() error {
	if strings.TrimSpace(g.Name) == "" {
		return errors.New("guest name is required")
	}
	if strings.TrimSpace(g.Phone) == "" {
		return errors.New("guest phone is required")
	}

	// Normalize Indian phone number if applicable
	normalizedPhone, err := ValidateAndNormalizeIndianPhone(g.Phone)
	if err == nil {
		g.Phone = normalizedPhone
	}

	if g.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if g.RoomID.IsZero() {
		return errors.New("roomId is required")
	}
	if g.Status == "" {
		g.Status = GuestCheckedIn
	}
	if g.CheckIn.IsZero() {
		g.CheckIn = time.Now().UTC()
	}
	if g.NumberOfGuests <= 0 {
		g.NumberOfGuests = 1
	}
	return nil
}

// HousekeepingTask represents a cleaning, linen change, or maintenance job.
type HousekeepingTask struct {
	ID          bson.ObjectID `bson:"_id,omitempty" json:"id"`
	TenantID    bson.ObjectID `bson:"tenantId" json:"tenantId"`
	RoomID      bson.ObjectID `bson:"roomId" json:"roomId"`
	RoomNumber  string        `bson:"roomNumber" json:"roomNumber"`
	TaskType    TaskType      `bson:"taskType" json:"taskType"`
	Title       string        `bson:"title" json:"title"`
	Priority    string        `bson:"priority" json:"priority"` // "normal", "high", "urgent"
	AssignedTo  string        `bson:"assignedTo,omitempty" json:"assignedTo,omitempty"`
	Status      TaskStatus    `bson:"status" json:"status"`
	Notes          string        `bson:"notes,omitempty" json:"notes,omitempty"`
	Source         string        `bson:"source,omitempty" json:"source,omitempty"`                 // "guest" | "staff"
	IsGuestRequest bool          `bson:"isGuestRequest" json:"isGuestRequest"`                     // true if initiated by customer QR
	CompletedAt    *time.Time    `bson:"completedAt,omitempty" json:"completedAt,omitempty"`
	CreatedAt      time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt      time.Time     `bson:"updatedAt" json:"updatedAt"`
}

func (t *HousekeepingTask) Validate() error {
	if strings.TrimSpace(t.Title) == "" {
		return errors.New("task title is required")
	}
	if t.TenantID.IsZero() {
		return errors.New("tenantId is required")
	}
	if t.RoomID.IsZero() {
		return errors.New("roomId is required")
	}
	if t.TaskType == "" {
		t.TaskType = TaskCleaning
	}
	if t.Status == "" {
		t.Status = TaskPending
	}
	if t.Priority == "" {
		t.Priority = "normal"
	}
	return nil
}

// UpdateGuestStayInput defines fields that can be modified on an active guest stay.
type UpdateGuestStayInput struct {
	Name             *string    `json:"name"`
	Phone            *string    `json:"phone"`
	Email            *string    `json:"email"`
	NumberOfGuests   *int       `json:"numberOfGuests"`
	CheckIn          *time.Time `json:"checkIn"`
	ExpectedCheckOut *time.Time `json:"expectedCheckOut"`
	Address          *string    `json:"address"`
	Nationality      *string    `json:"nationality"`
	IDProofType      *string    `json:"idProofType"`
	IDProofURL       *string    `json:"idProofUrl"`
	SpecialRequests  *string    `json:"specialRequests"`
}
