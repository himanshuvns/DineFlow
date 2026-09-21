package staff

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"
	"time"

	domainnotif "github.com/dineflow/api/internal/domain/notification"
	domainuser "github.com/dineflow/api/internal/domain/user"
	domainwa "github.com/dineflow/api/internal/domain/whatsapp"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	notifapp "github.com/dineflow/api/internal/application/notification"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"golang.org/x/crypto/bcrypt"
)

type NotificationEmitter interface {
	CreateNotification(ctx context.Context, input notifapp.CreateNotificationInput) (*domainnotif.Notification, error)
}

type Service struct {
	db           *mongoinfra.Client
	notifService NotificationEmitter
}

func NewService(db *mongoinfra.Client) *Service {
	return &Service{db: db}
}

func (s *Service) SetNotificationService(ne NotificationEmitter) {
	s.notifService = ne
}

// ── Staff Management & Profiles ─────────────────────────────────────────────

// cleanPhoneNumber formats phone numbers into standard E.164-compatible strings.
// Handles +91, 10-digit Indian numbers, and international prefixes.
func cleanPhoneNumber(phone string) string {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return ""
	}
	hasPlus := strings.HasPrefix(phone, "+")
	var sb strings.Builder
	for _, ch := range phone {
		if ch >= '0' && ch <= '9' {
			sb.WriteRune(ch)
		}
	}
	digits := sb.String()
	if digits == "" {
		return ""
	}
	if hasPlus {
		return "+" + digits
	}
	if len(digits) == 10 {
		return "+91" + digits
	}
	if len(digits) == 11 && strings.HasPrefix(digits, "0") {
		return "+91" + digits[1:]
	}
	if len(digits) == 12 && strings.HasPrefix(digits, "91") {
		return "+" + digits
	}
	return "+" + digits
}

type InviteStaffInput struct {
	Name           string                     `json:"name"`
	Phone          string                     `json:"phone"`
	Email          string                     `json:"email"`
	Role           domainuser.Role            `json:"role"`
	Department     string                     `json:"department"`
	EmploymentType string                     `json:"employmentType"`
	Salary         domainuser.SalaryStructure `json:"salary"`
}

type UpdateEmployeeProfileInput struct {
	Name             string                     `json:"name"`
	Phone            string                     `json:"phone"`
	Email            string                     `json:"email"`
	EmployeeID       string                     `json:"employeeId"`
	Department       string                     `json:"department"`
	EmploymentType   string                     `json:"employmentType"`
	JoiningDate      *time.Time                 `json:"joiningDate"`
	ShiftID          *bson.ObjectID             `json:"shiftId"`
	ShiftName        string                     `json:"shiftName"`
	Salary           domainuser.SalaryStructure `json:"salary"`
	BankDetails      domainuser.BankDetails     `json:"bankDetails"`
	EmergencyContact domainuser.EmergencyContact `json:"emergencyContact"`
	AadhaarNumber    string                     `json:"aadhaarNumber"`
	PANNumber        string                     `json:"panNumber"`
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

	// Ensure each user has an EmployeeID for HR display and valid Department
	for i := range users {
		if users[i].EmployeeID == "" {
			users[i].EmployeeID = fmt.Sprintf("DF-EMP-%04d", (i+1)*100+1)
		}
		// If user is owner or manager, ensure department is Management if empty or legacy "Floor Service"
		if (users[i].Role == domainuser.RoleOwner || users[i].Role == domainuser.RoleManager) &&
			(users[i].Department == "" || users[i].Department == "Floor Service") {
			users[i].Department = "Management"
			_, _ = scope.UpdateOne(ctx, bson.M{"_id": users[i].ID}, bson.M{"$set": bson.M{"department": "Management"}})
		}
	}

	return users, nil
}

func (s *Service) InviteStaff(ctx context.Context, tenantID bson.ObjectID, input InviteStaffInput) (*domainuser.User, error) {
	if strings.TrimSpace(input.Name) == "" {
		return nil, errors.New("name is required")
	}

	cleanPhone := cleanPhoneNumber(input.Phone)
	cleanEmail := strings.ToLower(strings.TrimSpace(input.Email))

	if cleanPhone == "" && cleanEmail == "" {
		return nil, errors.New("WhatsApp phone number or email is required")
	}

	if input.Role == "" {
		input.Role = domainuser.RoleWaiter
	}
	if input.Department == "" {
		switch input.Role {
		case domainuser.RoleChef:
			input.Department = "Kitchen"
		case domainuser.RoleWaiter:
			input.Department = "Floor Service"
		case domainuser.RoleCashier:
			input.Department = "Front Desk & Billing"
		case domainuser.RoleHousekeeping:
			input.Department = "Housekeeping"
		case domainuser.RoleManager, domainuser.RoleOwner:
			input.Department = "Management"
		default:
			input.Department = "General"
		}
	}
	if input.EmploymentType == "" {
		input.EmploymentType = "full_time"
	}

	if s.db != nil {
		coll := s.db.Collection("users")
		scope := mongoinfra.NewScope(coll, tenantID)

		// Check if already exists in this tenant
		var orConditions []bson.M
		if cleanPhone != "" {
			norm := domainwa.NormalizePhoneNumber(cleanPhone)
			orConditions = append(orConditions,
				bson.M{"phone": cleanPhone},
				bson.M{"phone": norm},
				bson.M{"phone": "+91" + norm},
			)
		}
		if cleanEmail != "" {
			orConditions = append(orConditions, bson.M{"email": cleanEmail})
		}

		if len(orConditions) > 0 {
			var existing domainuser.User
			err := scope.FindOne(ctx, bson.M{"$or": orConditions}, &existing)
			if err == nil {
				if cleanPhone != "" && (existing.Phone == cleanPhone || strings.HasSuffix(existing.Phone, domainwa.NormalizePhoneNumber(cleanPhone))) {
					return nil, errors.New("a staff member with this WhatsApp phone number already exists in this workspace")
				}
				return nil, errors.New("a staff member with this email already exists in this workspace")
			} else if err != mongo.ErrNoDocuments {
				return nil, err
			}
		}

		// Global phone uniqueness check (idx_user_phone is unique across collection)
		if cleanPhone != "" {
			norm := domainwa.NormalizePhoneNumber(cleanPhone)
			var globalExisting domainuser.User
			gErr := coll.FindOne(ctx, bson.M{
				"$or": []bson.M{
					{"phone": cleanPhone},
					{"phone": norm},
					{"phone": "+91" + norm},
				},
			}).Decode(&globalExisting)
			if gErr == nil {
				if globalExisting.TenantID == tenantID {
					return nil, errors.New("a staff member with this WhatsApp phone number already exists in this workspace")
				}
				return nil, errors.New("this phone number is already registered to another user on DineFlow")
			}
		}

		// Generate employee ID count
		count, _ := scope.Count(ctx, bson.M{})
		empID := fmt.Sprintf("DF-EMP-%04d", count+1001)

		now := time.Now().UTC()
		defaultHash, _ := bcrypt.GenerateFromPassword([]byte("DineFlow@2026"), bcrypt.DefaultCost)
		newUser := domainuser.User{
			ID:             bson.NewObjectID(),
			TenantID:       tenantID,
			Name:           strings.TrimSpace(input.Name),
			Email:          cleanEmail,
			Phone:          cleanPhone,
			Role:           input.Role,
			Permissions:    domainuser.DefaultPermissionsForRole(input.Role),
			Status:         domainuser.StatusActive,
			EmployeeID:     empID,
			Department:     input.Department,
			EmploymentType: input.EmploymentType,
			Salary:         input.Salary,
			JoiningDate:    &now,
			Auth: domainuser.Auth{
				PasswordHash:  string(defaultHash),
				PhoneVerified: true,
			},
			CreatedAt:      now,
			UpdatedAt:      now,
		}

		if _, err := scope.InsertOne(ctx, &newUser); err != nil {
			return nil, err
		}

		// Also initialize default leave balance
		go func() {
			bgCtx := context.Background()
			_ = s.initLeaveBalance(bgCtx, tenantID, newUser.ID)
		}()

		return &newUser, nil
	}

	// In memory fallback for tests without db
	now := time.Now().UTC()
	return &domainuser.User{
		ID:             bson.NewObjectID(),
		TenantID:       tenantID,
		Name:           strings.TrimSpace(input.Name),
		Email:          cleanEmail,
		Phone:          cleanPhone,
		Role:           input.Role,
		Permissions:    domainuser.DefaultPermissionsForRole(input.Role),
		Status:         domainuser.StatusActive,
		EmployeeID:     "DF-EMP-1001",
		Department:     input.Department,
		EmploymentType: input.EmploymentType,
		Salary:         input.Salary,
		JoiningDate:    &now,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
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

func (s *Service) UpdateEmployeeProfile(ctx context.Context, tenantID, userID bson.ObjectID, input UpdateEmployeeProfileInput) (*domainuser.User, error) {
	coll := s.db.Collection("users")
	scope := mongoinfra.NewScope(coll, tenantID)

	setMap := bson.M{
		"updatedAt": time.Now().UTC(),
	}
	if input.Name != "" {
		setMap["name"] = strings.TrimSpace(input.Name)
	}
	if input.Phone != "" {
		setMap["phone"] = cleanPhoneNumber(input.Phone)
	}
	if input.Email != "" {
		setMap["email"] = strings.ToLower(strings.TrimSpace(input.Email))
	}
	if input.EmployeeID != "" {
		setMap["employeeId"] = input.EmployeeID
	}
	if input.Department != "" {
		setMap["department"] = input.Department
	}
	if input.EmploymentType != "" {
		setMap["employmentType"] = input.EmploymentType
	}
	if input.JoiningDate != nil {
		setMap["joiningDate"] = input.JoiningDate
	}
	if input.ShiftID != nil {
		setMap["shiftId"] = input.ShiftID
	}
	if input.ShiftName != "" {
		setMap["shiftName"] = input.ShiftName
	}
	if input.Salary.Basic > 0 || input.Salary.HRA > 0 || input.Salary.OvertimeRate > 0 {
		setMap["salary"] = input.Salary
	}
	if input.BankDetails.AccountNumber != "" || input.BankDetails.IFSC != "" {
		setMap["bankDetails"] = input.BankDetails
	}
	if input.EmergencyContact.Phone != "" || input.EmergencyContact.Name != "" {
		setMap["emergencyContact"] = input.EmergencyContact
	}
	if input.AadhaarNumber != "" {
		setMap["aadhaarNumber"] = input.AadhaarNumber
	}
	if input.PANNumber != "" {
		setMap["panNumber"] = input.PANNumber
	}

	res, err := scope.UpdateByID(ctx, userID, bson.M{"$set": setMap})
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, errors.New("employee not found")
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

// ── Geofence Configuration ──────────────────────────────────────────────────

func (s *Service) GetGeofence(ctx context.Context, tenantID bson.ObjectID) (*domainuser.GeofenceConfig, error) {
	coll := s.db.Collection("geofence_settings")
	scope := mongoinfra.NewScope(coll, tenantID)

	var config domainuser.GeofenceConfig
	err := scope.FindOne(ctx, bson.M{}, &config)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Return sensible default for DineFlow (Delhi flagship / configurable)
			return &domainuser.GeofenceConfig{
				TenantID:        tenantID,
				Latitude:        28.6315,
				Longitude:       77.2167,
				RadiusMeters:    100,
				Address:         "Connaught Place Central, New Delhi",
				EnforceGeofence: false,
				UpdatedAt:       time.Now().UTC(),
			}, nil
		}
		return nil, err
	}
	return &config, nil
}

func (s *Service) UpdateGeofence(ctx context.Context, tenantID bson.ObjectID, input domainuser.GeofenceConfig) (*domainuser.GeofenceConfig, error) {
	coll := s.db.Collection("geofence_settings")
	scope := mongoinfra.NewScope(coll, tenantID)

	if input.RadiusMeters <= 0 {
		input.RadiusMeters = 100
	}
	input.TenantID = tenantID
	input.UpdatedAt = time.Now().UTC()

	var existing domainuser.GeofenceConfig
	err := scope.FindOne(ctx, bson.M{}, &existing)
	if err == nil {
		_, err = scope.UpdateByID(ctx, existing.ID, bson.M{
			"$set": bson.M{
				"latitude":        input.Latitude,
				"longitude":       input.Longitude,
				"radiusMeters":    input.RadiusMeters,
				"address":         input.Address,
				"enforceGeofence": input.EnforceGeofence,
				"updatedAt":       input.UpdatedAt,
			},
		})
		if err != nil {
			return nil, err
		}
	} else {
		input.ID = bson.NewObjectID()
		if _, err := scope.InsertOne(ctx, &input); err != nil {
			return nil, err
		}
	}

	return s.GetGeofence(ctx, tenantID)
}

// ── Shift Management ────────────────────────────────────────────────────────

func (s *Service) ListShifts(ctx context.Context, tenantID bson.ObjectID) ([]domainuser.Shift, error) {
	coll := s.db.Collection("shifts")
	scope := mongoinfra.NewScope(coll, tenantID)

	cursor, err := scope.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var shifts []domainuser.Shift
	if err := cursor.All(ctx, &shifts); err != nil {
		return nil, err
	}

	// Seed defaults if empty
	if len(shifts) == 0 {
		now := time.Now().UTC()
		defaultShifts := []domainuser.Shift{
			{
				ID:           bson.NewObjectID(),
				TenantID:     tenantID,
				Name:         "Morning Shift",
				StartTime:    "09:00",
				EndTime:      "18:00",
				GraceMinutes: 15,
				BreakMinutes: 60,
				IsDefault:    true,
				CreatedAt:    now,
			},
			{
				ID:           bson.NewObjectID(),
				TenantID:     tenantID,
				Name:         "Evening Shift",
				StartTime:    "14:00",
				EndTime:      "23:00",
				GraceMinutes: 15,
				BreakMinutes: 45,
				IsDefault:    false,
				CreatedAt:    now,
			},
			{
				ID:           bson.NewObjectID(),
				TenantID:     tenantID,
				Name:         "Night Shift",
				StartTime:    "22:00",
				EndTime:      "07:00",
				GraceMinutes: 15,
				BreakMinutes: 60,
				IsDefault:    false,
				CreatedAt:    now,
			},
		}
		for _, ds := range defaultShifts {
			_, _ = scope.InsertOne(ctx, ds)
		}
		return defaultShifts, nil
	}

	return shifts, nil
}

func (s *Service) CreateShift(ctx context.Context, tenantID bson.ObjectID, shift domainuser.Shift) (*domainuser.Shift, error) {
	if shift.Name == "" || shift.StartTime == "" || shift.EndTime == "" {
		return nil, errors.New("name, startTime, and endTime are required")
	}
	coll := s.db.Collection("shifts")
	scope := mongoinfra.NewScope(coll, tenantID)

	shift.ID = bson.NewObjectID()
	shift.TenantID = tenantID
	shift.CreatedAt = time.Now().UTC()

	if _, err := scope.InsertOne(ctx, &shift); err != nil {
		return nil, err
	}
	return &shift, nil
}

// ── Attendance Engine ───────────────────────────────────────────────────────

type ClockInRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type ClockOutRequest struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func (s *Service) ClockIn(ctx context.Context, tenantID, userID bson.ObjectID, lat, lng float64) (*domainuser.AttendanceRecord, error) {
	now := time.Now().UTC()
	today := now.Format("2006-01-02")

	// 1. Check Geofence
	geo, err := s.GetGeofence(ctx, tenantID)
	if err == nil && geo != nil && geo.EnforceGeofence {
		dist := domainuser.CalculateDistanceMeters(lat, lng, geo.Latitude, geo.Longitude)
		if dist > geo.RadiusMeters {
			return nil, fmt.Errorf("out of bounds: you are %.1fm away from workplace (max allowed %.0fm)", dist, geo.RadiusMeters)
		}
	}

	// 2. Fetch User Profile
	uColl := s.db.Collection("users")
	uScope := mongoinfra.NewScope(uColl, tenantID)
	var u domainuser.User
	if err := uScope.FindByID(ctx, userID, &u); err != nil {
		return nil, errors.New("staff member not found")
	}

	// 3. Check existing today's record
	attColl := s.db.Collection("attendance")
	attScope := mongoinfra.NewScope(attColl, tenantID)

	var existing domainuser.AttendanceRecord
	err = attScope.FindOne(ctx, bson.M{"userId": userID, "date": today}, &existing)
	if err == nil {
		if existing.CheckInTime != nil && existing.CheckOutTime == nil {
			return nil, errors.New("already clocked in for today")
		}
		if existing.CheckOutTime != nil {
			return nil, errors.New("shift already completed for today")
		}
	}

	// Calculate distance from geofence point for logging
	dist := 0.0
	if geo != nil && geo.Latitude != 0 {
		dist = domainuser.CalculateDistanceMeters(lat, lng, geo.Latitude, geo.Longitude)
	}

	// 4. Determine status (Late vs Present based on shift)
	status := domainuser.AttendancePresent
	shifts, _ := s.ListShifts(ctx, tenantID)
	var targetShift *domainuser.Shift
	for _, sh := range shifts {
		if sh.IsDefault || (u.ShiftID != nil && sh.ID == *u.ShiftID) {
			targetShift = &sh
			break
		}
	}

	if targetShift != nil && targetShift.StartTime != "" {
		// e.g. "09:00"
		parts := strings.Split(targetShift.StartTime, ":")
		if len(parts) == 2 {
			var hour, min int
			_, _ = fmt.Sscanf(parts[0], "%d", &hour)
			_, _ = fmt.Sscanf(parts[1], "%d", &min)
			grace := targetShift.GraceMinutes
			if grace <= 0 {
				grace = 15
			}
			allowedMinutes := hour*60 + min + grace
			curMinutes := now.Hour()*60 + now.Minute()
			if curMinutes > allowedMinutes {
				status = domainuser.AttendanceLate
			}
		}
	}

	record := domainuser.AttendanceRecord{
		ID:              bson.NewObjectID(),
		TenantID:        tenantID,
		UserID:          userID,
		EmployeeID:      u.EmployeeID,
		EmployeeName:    u.Name,
		Department:      u.Department,
		Date:            today,
		CheckInTime:     &now,
		CheckInLat:      lat,
		CheckInLng:      lng,
		CheckInDistance: dist,
		Status:          status,
		CreatedAt:       now,
		UpdatedAt:       now,
	}

	if _, err := attScope.InsertOne(ctx, &record); err != nil {
		return nil, err
	}

	return &record, nil
}

func (s *Service) ClockOut(ctx context.Context, tenantID, userID bson.ObjectID, lat, lng float64) (*domainuser.AttendanceRecord, error) {
	now := time.Now().UTC()
	today := now.Format("2006-01-02")

	attColl := s.db.Collection("attendance")
	attScope := mongoinfra.NewScope(attColl, tenantID)

	var record domainuser.AttendanceRecord
	err := attScope.FindOne(ctx, bson.M{"userId": userID, "date": today}, &record)
	if err != nil {
		return nil, errors.New("no active clock-in found for today")
	}
	if record.CheckOutTime != nil {
		return nil, errors.New("already clocked out for today")
	}

	// If currently on break, close open break log
	if record.IsOnBreak && len(record.Breaks) > 0 {
		idx := len(record.Breaks) - 1
		record.Breaks[idx].EndTime = &now
		mins := int(now.Sub(record.Breaks[idx].StartTime).Minutes())
		record.Breaks[idx].Minutes = mins
		record.BreakHours += float64(mins) / 60.0
		record.IsOnBreak = false
	}

	// Calculate working hours
	totalHours := 0.0
	if record.CheckInTime != nil {
		totalHours = now.Sub(*record.CheckInTime).Hours()
	}
	workingHours := math.Max(0, totalHours-record.BreakHours)
	workingHours = math.Round(workingHours*100) / 100

	overtimeHours := 0.0
	if workingHours > 8.0 {
		overtimeHours = math.Round((workingHours-8.0)*100) / 100
	}

	record.CheckOutTime = &now
	record.CheckOutLat = lat
	record.CheckOutLng = lng
	record.WorkingHours = workingHours
	record.OvertimeHours = overtimeHours
	record.UpdatedAt = now

	_, err = attScope.UpdateByID(ctx, record.ID, bson.M{
		"$set": bson.M{
			"checkOutTime":  record.CheckOutTime,
			"checkOutLat":   record.CheckOutLat,
			"checkOutLng":   record.CheckOutLng,
			"breaks":        record.Breaks,
			"isOnBreak":     record.IsOnBreak,
			"workingHours":  record.WorkingHours,
			"breakHours":    record.BreakHours,
			"overtimeHours": record.OvertimeHours,
			"updatedAt":     now,
		},
	})
	if err != nil {
		return nil, err
	}

	return &record, nil
}

func (s *Service) ToggleBreak(ctx context.Context, tenantID, userID bson.ObjectID) (*domainuser.AttendanceRecord, error) {
	now := time.Now().UTC()
	today := now.Format("2006-01-02")

	attColl := s.db.Collection("attendance")
	attScope := mongoinfra.NewScope(attColl, tenantID)

	var record domainuser.AttendanceRecord
	err := attScope.FindOne(ctx, bson.M{"userId": userID, "date": today}, &record)
	if err != nil || record.CheckInTime == nil || record.CheckOutTime != nil {
		return nil, errors.New("must be currently clocked in to toggle break")
	}

	if !record.IsOnBreak {
		// Start break
		record.Breaks = append(record.Breaks, domainuser.BreakLog{
			StartTime: now,
		})
		record.IsOnBreak = true
	} else {
		// End break
		if len(record.Breaks) > 0 {
			idx := len(record.Breaks) - 1
			record.Breaks[idx].EndTime = &now
			mins := int(now.Sub(record.Breaks[idx].StartTime).Minutes())
			if mins < 1 {
				mins = 1
			}
			record.Breaks[idx].Minutes = mins
			record.BreakHours += float64(mins) / 60.0
			record.BreakHours = math.Round(record.BreakHours*100) / 100
		}
		record.IsOnBreak = false
	}
	record.UpdatedAt = now

	_, err = attScope.UpdateByID(ctx, record.ID, bson.M{
		"$set": bson.M{
			"breaks":     record.Breaks,
			"isOnBreak":  record.IsOnBreak,
			"breakHours": record.BreakHours,
			"updatedAt":  now,
		},
	})
	if err != nil {
		return nil, err
	}

	return &record, nil
}

func (s *Service) GetTodayAttendance(ctx context.Context, tenantID bson.ObjectID) ([]domainuser.AttendanceRecord, error) {
	today := time.Now().UTC().Format("2006-01-02")
	coll := s.db.Collection("attendance")
	scope := mongoinfra.NewScope(coll, tenantID)

	cursor, err := scope.Find(ctx, bson.M{"date": today}, options.Find().SetSort(bson.D{{Key: "checkInTime", Value: -1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domainuser.AttendanceRecord
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domainuser.AttendanceRecord{}
	}
	return list, nil
}

func (s *Service) GetAttendanceHistory(ctx context.Context, tenantID bson.ObjectID, userID *bson.ObjectID, startDate, endDate string) ([]domainuser.AttendanceRecord, error) {
	coll := s.db.Collection("attendance")
	scope := mongoinfra.NewScope(coll, tenantID)

	filter := bson.M{}
	if userID != nil && !userID.IsZero() {
		filter["userId"] = *userID
	}
	if startDate != "" && endDate != "" {
		filter["date"] = bson.M{"$gte": startDate, "$lte": endDate}
	} else if startDate != "" {
		filter["date"] = bson.M{"$gte": startDate}
	}

	opts := options.Find().SetSort(bson.D{{Key: "date", Value: -1}, {Key: "checkInTime", Value: -1}}).SetLimit(100)
	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domainuser.AttendanceRecord
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domainuser.AttendanceRecord{}
	}
	return list, nil
}

// ── Leave Management ────────────────────────────────────────────────────────

func (s *Service) initLeaveBalance(ctx context.Context, tenantID, userID bson.ObjectID) error {
	year := time.Now().UTC().Year()
	coll := s.db.Collection("leave_balances")
	scope := mongoinfra.NewScope(coll, tenantID)

	var existing domainuser.LeaveBalance
	err := scope.FindOne(ctx, bson.M{"userId": userID, "year": year}, &existing)
	if err == nil {
		return nil
	}

	bal := domainuser.LeaveBalance{
		ID:          bson.NewObjectID(),
		TenantID:    tenantID,
		UserID:      userID,
		CasualTotal: 12,
		CasualUsed:  0,
		SickTotal:   8,
		SickUsed:    0,
		EarnedTotal: 15,
		EarnedUsed:  0,
		Year:        year,
	}
	_, err = scope.InsertOne(ctx, &bal)
	return err
}

func (s *Service) GetLeaveBalances(ctx context.Context, tenantID, userID bson.ObjectID) (*domainuser.LeaveBalance, error) {
	year := time.Now().UTC().Year()
	coll := s.db.Collection("leave_balances")
	scope := mongoinfra.NewScope(coll, tenantID)

	var bal domainuser.LeaveBalance
	err := scope.FindOne(ctx, bson.M{"userId": userID, "year": year}, &bal)
	if err != nil {
		_ = s.initLeaveBalance(ctx, tenantID, userID)
		return &domainuser.LeaveBalance{
			TenantID:    tenantID,
			UserID:      userID,
			CasualTotal: 12,
			CasualUsed:  0,
			SickTotal:   8,
			SickUsed:    0,
			EarnedTotal: 15,
			EarnedUsed:  0,
			Year:        year,
		}, nil
	}
	return &bal, nil
}

func (s *Service) ApplyLeave(ctx context.Context, tenantID, userID bson.ObjectID, req domainuser.LeaveRequest) (*domainuser.LeaveRequest, error) {
	if req.StartDate == "" || req.EndDate == "" {
		return nil, errors.New("startDate and endDate are required")
	}
	if req.LeaveType == "" {
		req.LeaveType = domainuser.LeaveCasual
	}

	tStart, err1 := time.Parse("2006-01-02", req.StartDate)
	tEnd, err2 := time.Parse("2006-01-02", req.EndDate)
	if err1 != nil || err2 != nil {
		return nil, errors.New("dates must be in YYYY-MM-DD format")
	}
	if tEnd.Before(tStart) {
		return nil, errors.New("endDate cannot be before startDate")
	}

	days := 1.0
	if req.IsHalfDay {
		days = 0.5
	} else {
		days = float64(int(tEnd.Sub(tStart).Hours()/24) + 1)
	}
	req.DaysCount = days

	// Lookup user details
	uColl := s.db.Collection("users")
	uScope := mongoinfra.NewScope(uColl, tenantID)
	var u domainuser.User
	if err := uScope.FindByID(ctx, userID, &u); err == nil {
		req.EmployeeName = u.Name
		req.EmployeeID = u.EmployeeID
	}

	now := time.Now().UTC()
	req.ID = bson.NewObjectID()
	req.TenantID = tenantID
	req.UserID = userID
	req.Status = domainuser.LeavePending
	req.CreatedAt = now
	req.UpdatedAt = now

	coll := s.db.Collection("leave_requests")
	scope := mongoinfra.NewScope(coll, tenantID)
	if _, err := scope.InsertOne(ctx, &req); err != nil {
		return nil, err
	}

	// Dispatch notification to managers/owners
	if s.notifService != nil {
		go func() {
			bgCtx := context.Background()
			_, _ = s.notifService.CreateNotification(bgCtx, notifapp.CreateNotificationInput{
				TenantID:  tenantID,
				Category:  domainnotif.CategoryStaff,
				Title:     "New Leave Request Submitted",
				Message:   fmt.Sprintf("%s applied for %.1f days of %s leave (%s to %s)", req.EmployeeName, req.DaysCount, req.LeaveType, req.StartDate, req.EndDate),
				Priority:  domainnotif.PriorityMedium,
				ActionURL: "/dashboard/staff?tab=leaves",
			})
		}()
	}

	return &req, nil
}

func (s *Service) ListLeaves(ctx context.Context, tenantID bson.ObjectID, userID *bson.ObjectID) ([]domainuser.LeaveRequest, error) {
	coll := s.db.Collection("leave_requests")
	scope := mongoinfra.NewScope(coll, tenantID)

	filter := bson.M{}
	if userID != nil && !userID.IsZero() {
		filter["userId"] = *userID
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(100)
	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domainuser.LeaveRequest
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domainuser.LeaveRequest{}
	}
	return list, nil
}

func (s *Service) ApproveLeave(ctx context.Context, tenantID, leaveID bson.ObjectID, approverName string) (*domainuser.LeaveRequest, error) {
	coll := s.db.Collection("leave_requests")
	scope := mongoinfra.NewScope(coll, tenantID)

	var req domainuser.LeaveRequest
	if err := scope.FindByID(ctx, leaveID, &req); err != nil {
		return nil, errors.New("leave request not found")
	}

	now := time.Now().UTC()
	req.Status = domainuser.LeaveApproved
	req.ApprovedBy = approverName
	req.ApprovedAt = &now
	req.UpdatedAt = now

	_, err := scope.UpdateByID(ctx, leaveID, bson.M{
		"$set": bson.M{
			"status":     req.Status,
			"approvedBy": req.ApprovedBy,
			"approvedAt": req.ApprovedAt,
			"updatedAt":  now,
		},
	})
	if err != nil {
		return nil, err
	}

	// Update leave balance
	balColl := s.db.Collection("leave_balances")
	balScope := mongoinfra.NewScope(balColl, tenantID)
	year := now.Year()
	field := "casualUsed"
	if req.LeaveType == domainuser.LeaveSick {
		field = "sickUsed"
	} else if req.LeaveType == domainuser.LeaveEarned {
		field = "earnedUsed"
	}
	_, _ = balScope.UpdateOne(ctx, bson.M{"userId": req.UserID, "year": year}, bson.M{
		"$inc": bson.M{field: req.DaysCount},
	})

	// Dispatch alert to employee
	if s.notifService != nil {
		go func() {
			bgCtx := context.Background()
			_, _ = s.notifService.CreateNotification(bgCtx, notifapp.CreateNotificationInput{
				TenantID:  tenantID,
				UserID:    &req.UserID,
				Category:  domainnotif.CategoryStaff,
				Title:     "Leave Approved",
				Message:   fmt.Sprintf("Your %s leave (%s to %s) was approved by %s.", req.LeaveType, req.StartDate, req.EndDate, approverName),
				Priority:  domainnotif.PriorityMedium,
				ActionURL: "/dashboard/staff?tab=leaves",
			})
		}()
	}

	return &req, nil
}

func (s *Service) RejectLeave(ctx context.Context, tenantID, leaveID bson.ObjectID, rejecterName, reason string) (*domainuser.LeaveRequest, error) {
	coll := s.db.Collection("leave_requests")
	scope := mongoinfra.NewScope(coll, tenantID)

	var req domainuser.LeaveRequest
	if err := scope.FindByID(ctx, leaveID, &req); err != nil {
		return nil, errors.New("leave request not found")
	}

	now := time.Now().UTC()
	req.Status = domainuser.LeaveRejected
	req.RejectionReason = reason
	req.ApprovedBy = rejecterName
	req.UpdatedAt = now

	_, err := scope.UpdateByID(ctx, leaveID, bson.M{
		"$set": bson.M{
			"status":          req.Status,
			"approvedBy":      req.ApprovedBy,
			"rejectionReason": req.RejectionReason,
			"updatedAt":       now,
		},
	})
	if err != nil {
		return nil, err
	}

	// Dispatch alert to employee
	if s.notifService != nil {
		go func() {
			bgCtx := context.Background()
			_, _ = s.notifService.CreateNotification(bgCtx, notifapp.CreateNotificationInput{
				TenantID:  tenantID,
				UserID:    &req.UserID,
				Category:  domainnotif.CategoryStaff,
				Title:     "Leave Request Rejected",
				Message:   fmt.Sprintf("Your leave request was rejected: %s", reason),
				Priority:  domainnotif.PriorityMedium,
				ActionURL: "/dashboard/staff?tab=leaves",
			})
		}()
	}

	return &req, nil
}

// ── Payroll & Payslips ──────────────────────────────────────────────────────

func (s *Service) RunPayroll(ctx context.Context, tenantID bson.ObjectID, month string) ([]domainuser.PayrollRecord, error) {
	if month == "" {
		month = time.Now().UTC().Format("2006-01")
	}

	staffList, err := s.ListStaff(ctx, tenantID)
	if err != nil {
		return nil, err
	}

	payColl := s.db.Collection("payroll_records")
	payScope := mongoinfra.NewScope(payColl, tenantID)

	attColl := s.db.Collection("attendance")
	attScope := mongoinfra.NewScope(attColl, tenantID)

	now := time.Now().UTC()
	var records []domainuser.PayrollRecord

	for _, st := range staffList {
		if st.Status == domainuser.StatusInactive {
			continue
		}

		// Calculate monthly attendance
		cursor, err := attScope.Find(ctx, bson.M{
			"userId": st.ID,
			"date":   bson.M{"$regex": "^" + month},
		})

		presentDays := 0
		absentDays := 0
		overtimeHours := 0.0

		if err == nil {
			var attList []domainuser.AttendanceRecord
			_ = cursor.All(ctx, &attList)
			_ = cursor.Close(ctx)
			for _, rec := range attList {
				if rec.Status == domainuser.AttendancePresent || rec.Status == domainuser.AttendanceLate {
					presentDays++
				} else if rec.Status == domainuser.AttendanceAbsent {
					absentDays++
				}
				overtimeHours += rec.OvertimeHours
			}
		}

		// Salary structure calculation
		basic := st.Salary.Basic
		if basic <= 0 {
			switch st.Role {
			case domainuser.RoleChef:
				basic = 30000
			case domainuser.RoleManager:
				basic = 35000
			case domainuser.RoleWaiter:
				basic = 18000
			case domainuser.RoleCashier:
				basic = 22000
			default:
				basic = 25000
			}
		}

		hra := st.Salary.HRA
		if hra <= 0 {
			hra = math.Round(basic * 0.40)
		}

		allowance := st.Salary.SpecialAllowance
		if allowance <= 0 {
			allowance = 3000
		}

		otRate := st.Salary.OvertimeRate
		if otRate <= 0 {
			otRate = 180
		}
		otPay := math.Round(overtimeHours * otRate)

		gross := basic + hra + allowance + otPay

		// Indian standard statutory deductions (PF ~12% or cap 1800, Professional Tax 200)
		pfDeduction := math.Min(1800, math.Round(basic*0.12))
		ptDeduction := 200.0
		deductions := pfDeduction + ptDeduction
		netPay := gross - deductions

		rec := domainuser.PayrollRecord{
			ID:            bson.NewObjectID(),
			TenantID:      tenantID,
			UserID:        st.ID,
			EmployeeID:    st.EmployeeID,
			EmployeeName:  st.Name,
			Role:          st.Role,
			Department:    st.Department,
			Month:         month,
			Year:          now.Year(),
			PresentDays:   presentDays,
			AbsentDays:    absentDays,
			OvertimeHours: overtimeHours,
			BasicSalary:   basic,
			HRA:           hra,
			Allowances:    allowance,
			OvertimePay:   otPay,
			GrossEarnings: gross,
			Deductions:    deductions,
			NetPay:        netPay,
			PaymentStatus: "paid",
			PaidAt:        &now,
			CreatedAt:     now,
		}

		// Upsert into payroll_records for this user and month
		var existing domainuser.PayrollRecord
		errFind := payScope.FindOne(ctx, bson.M{"userId": st.ID, "month": month}, &existing)
		if errFind == nil {
			rec.ID = existing.ID
			_, err = payScope.UpdateByID(ctx, existing.ID, bson.M{
				"$set": rec,
			})
		} else {
			_, err = payScope.InsertOne(ctx, &rec)
		}
		if err == nil {
			records = append(records, rec)
		}
	}

	// Dispatch notification
	if s.notifService != nil {
		go func() {
			bgCtx := context.Background()
			_, _ = s.notifService.CreateNotification(bgCtx, notifapp.CreateNotificationInput{
				TenantID:  tenantID,
				Category:  domainnotif.CategoryStaff,
				Title:     "Monthly Payroll Run Completed",
				Message:   fmt.Sprintf("Processed payroll for %s. Generated %d employee payslips.", month, len(records)),
				Priority:  domainnotif.PriorityMedium,
				ActionURL: "/dashboard/staff?tab=payroll",
			})
		}()
	}

	return records, nil
}

func (s *Service) ListPayslips(ctx context.Context, tenantID bson.ObjectID, month string) ([]domainuser.PayrollRecord, error) {
	coll := s.db.Collection("payroll_records")
	scope := mongoinfra.NewScope(coll, tenantID)

	filter := bson.M{}
	if month != "" {
		filter["month"] = month
	}

	opts := options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}).SetLimit(100)
	cursor, err := scope.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domainuser.PayrollRecord
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}
	if list == nil {
		list = []domainuser.PayrollRecord{}
	}
	return list, nil
}

func (s *Service) GetPayslip(ctx context.Context, tenantID, payslipID bson.ObjectID) (*domainuser.PayrollRecord, error) {
	coll := s.db.Collection("payroll_records")
	scope := mongoinfra.NewScope(coll, tenantID)

	var rec domainuser.PayrollRecord
	if err := scope.FindByID(ctx, payslipID, &rec); err != nil {
		return nil, errors.New("payslip not found")
	}
	return &rec, nil
}

func (s *Service) GeneratePayslipHTML(ctx context.Context, tenantID, payslipID bson.ObjectID) (string, error) {
	rec, err := s.GetPayslip(ctx, tenantID, payslipID)
	if err != nil {
		return "", err
	}

	html := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Payslip - %s (%s)</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
  .title { font-size: 24px; font-weight: 700; color: #0f172a; }
  .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
  .badge { background: #dcfce7; color: #15803d; font-weight: 600; padding: 4px 12px; border-radius: 9999px; font-size: 12px; }
  .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; font-size: 14px; }
  .info-item { display: flex; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 6px; }
  .info-label { color: #64748b; font-weight: 500; }
  .info-value { font-weight: 600; color: #0f172a; }
  .tables { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
  table { width: 100%%; border-collapse: collapse; font-size: 14px; }
  th, td { padding: 10px 14px; text-align: left; }
  th { background: #f1f5f9; color: #475569; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }
  .text-right { text-align: right; }
  .total-row { font-weight: 700; border-top: 2px solid #cbd5e1; background: #f8fafc; }
  .net-pay-box { margin-top: 32px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; text-align: center; }
  .net-pay-val { font-size: 28px; font-weight: 800; color: #166534; margin-top: 4px; }
  .footer { margin-top: 48px; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 24px; }
  @media print {
    .no-print { display: none; }
    body { margin: 0; }
  }
</style>
</head>
<body>
<div class="no-print" style="margin-bottom: 20px;">
  <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Print / Download PDF</button>
</div>
<div class="header">
  <div>
    <div class="title">DINEFLOW HOSPITALITY OS</div>
    <div class="subtitle">Salary Statement &bullet; Month: %s</div>
  </div>
  <div style="text-align: right;">
    <span class="badge">PAID</span>
    <div class="subtitle" style="margin-top: 8px;">Generated: %s</div>
  </div>
</div>

<div class="grid-info">
  <div class="info-item"><span class="info-label">Employee Name</span><span class="info-value">%s</span></div>
  <div class="info-item"><span class="info-label">Employee ID</span><span class="info-value">%s</span></div>
  <div class="info-item"><span class="info-label">Department</span><span class="info-value">%s</span></div>
  <div class="info-item"><span class="info-label">Designation</span><span class="info-value">%s</span></div>
  <div class="info-item"><span class="info-label">Present Days</span><span class="info-value">%d Days</span></div>
  <div class="info-item"><span class="info-label">Overtime Hours</span><span class="info-value">%.1f Hrs</span></div>
</div>

<div class="tables">
  <div>
    <table>
      <thead><tr><th>Earnings Component</th><th class="text-right">Amount (₹)</th></tr></thead>
      <tbody>
        <tr><td>Basic Salary</td><td class="text-right">₹%.2f</td></tr>
        <tr><td>House Rent Allowance (HRA)</td><td class="text-right">₹%.2f</td></tr>
        <tr><td>Special Allowance</td><td class="text-right">₹%.2f</td></tr>
        <tr><td>Overtime Pay</td><td class="text-right">₹%.2f</td></tr>
        <tr class="total-row"><td>Total Gross Earnings</td><td class="text-right">₹%.2f</td></tr>
      </tbody>
    </table>
  </div>
  <div>
    <table>
      <thead><tr><th>Deductions</th><th class="text-right">Amount (₹)</th></tr></thead>
      <tbody>
        <tr><td>Provident Fund (PF)</td><td class="text-right">₹%.2f</td></tr>
        <tr><td>Professional Tax (PT)</td><td class="text-right">₹200.00</td></tr>
        <tr class="total-row"><td>Total Deductions</td><td class="text-right">₹%.2f</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="net-pay-box">
  <div style="font-size: 14px; font-weight: 600; color: #15803d; letter-spacing: 0.5px;">NET SALARY PAYABLE</div>
  <div class="net-pay-val">₹%.2f</div>
</div>

<div class="footer">
  <div>This is a computer-generated payslip and requires no physical signature.</div>
  <div>Authorized Signatory &bull; DineFlow HR</div>
</div>
</body>
</html>`,
		rec.EmployeeName, rec.Month,
		rec.Month,
		rec.CreatedAt.Format("02 Jan 2006"),
		rec.EmployeeName,
		rec.EmployeeID,
		rec.Department,
		rec.Role,
		rec.PresentDays,
		rec.OvertimeHours,
		rec.BasicSalary,
		rec.HRA,
		rec.Allowances,
		rec.OvertimePay,
		rec.GrossEarnings,
		rec.Deductions-200, // PF portion
		rec.Deductions,
		rec.NetPay,
	)

	return html, nil
}

// ── Holiday Management ──────────────────────────────────────────────────────

func (s *Service) ListHolidays(ctx context.Context, tenantID bson.ObjectID, year int) ([]domainuser.Holiday, error) {
	if year <= 0 {
		year = time.Now().UTC().Year()
	}

	coll := s.db.Collection("holidays")
	scope := mongoinfra.NewScope(coll, tenantID)

	cursor, err := scope.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "date", Value: 1}}))
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var list []domainuser.Holiday
	if err := cursor.All(ctx, &list); err != nil {
		return nil, err
	}

	// Seed standard Indian & restaurant holidays if empty
	if len(list) == 0 {
		now := time.Now().UTC()
		defaults := []domainuser.Holiday{
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "New Year's Day", Date: fmt.Sprintf("%d-01-01", year), Type: "national", CreatedAt: now},
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "Republic Day", Date: fmt.Sprintf("%d-01-26", year), Type: "national", CreatedAt: now},
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "Holi", Date: fmt.Sprintf("%d-03-25", year), Type: "national", CreatedAt: now},
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "Independence Day", Date: fmt.Sprintf("%d-08-15", year), Type: "national", CreatedAt: now},
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "Gandhi Jayanti", Date: fmt.Sprintf("%d-10-02", year), Type: "national", CreatedAt: now},
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "Diwali", Date: fmt.Sprintf("%d-11-01", year), Type: "national", CreatedAt: now},
			{ID: bson.NewObjectID(), TenantID: tenantID, Name: "Christmas Day", Date: fmt.Sprintf("%d-12-25", year), Type: "national", CreatedAt: now},
		}
		for _, h := range defaults {
			_, _ = scope.InsertOne(ctx, h)
		}
		return defaults, nil
	}

	return list, nil
}

func (s *Service) CreateHoliday(ctx context.Context, tenantID bson.ObjectID, h domainuser.Holiday) (*domainuser.Holiday, error) {
	if h.Name == "" || h.Date == "" {
		return nil, errors.New("holiday name and date are required")
	}
	if h.Type == "" {
		h.Type = "restaurant"
	}
	coll := s.db.Collection("holidays")
	scope := mongoinfra.NewScope(coll, tenantID)

	h.ID = bson.NewObjectID()
	h.TenantID = tenantID
	h.CreatedAt = time.Now().UTC()

	if _, err := scope.InsertOne(ctx, &h); err != nil {
		return nil, err
	}
	return &h, nil
}
