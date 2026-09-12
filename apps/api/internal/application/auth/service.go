package auth

import (
	"context"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/dineflow/api/internal/domain/tenant"
	"github.com/dineflow/api/internal/domain/user"
	mongoinfra "github.com/dineflow/api/internal/infrastructure/mongodb"
	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	"github.com/dineflow/api/pkg/otp"
	"github.com/dineflow/api/pkg/token"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

// ─── Errors ───────────────────────────────────────────────────────────────────

var (
	ErrEmailAlreadyExists   = errors.New("an account with this email already exists")
	ErrPhoneAlreadyExists   = errors.New("an account with this mobile number already exists")
	ErrInvalidPhone         = errors.New("please enter a valid mobile number")
	ErrInvalidCredentials   = errors.New("invalid mobile number or password")
	ErrAccountLocked        = errors.New("account is temporarily locked due to too many failed attempts")
	ErrInvalidOTP           = errors.New("invalid or expired verification code")
	ErrInvalidRefreshToken  = errors.New("invalid or expired refresh token")
	ErrSlugAlreadyExists    = errors.New("business URL slug already taken")
)

const maxFailedAttempts = 5

// ─── DTOs ─────────────────────────────────────────────────────────────────────

// RegisterRequest is the input for business registration.
type RegisterRequest struct {
	BusinessName string              `json:"businessName" validate:"required,min=2,max=100"`
	BusinessType tenant.BusinessType `json:"businessType" validate:"required"`
	Phone        string              `json:"phone"`
	Email        string              `json:"email,omitempty"`
	Password     string              `json:"password" validate:"required,min=8"`
	Name         string              `json:"name"`
	FirstName    string              `json:"firstName,omitempty"`
	LastName     string              `json:"lastName,omitempty"`
	Timezone     string              `json:"timezone"`
	Country      string              `json:"country"`
}

// VerifyOTPRequest is the input for OTP verification.
type VerifyOTPRequest struct {
	Phone string `json:"phone"`
	Email string `json:"email,omitempty"`
	OTP   string `json:"otp"`
	Code  string `json:"code,omitempty"`
}

// LoginRequest is the input for mobile/password login.
type LoginRequest struct {
	Phone    string `json:"phone"`
	Email    string `json:"email,omitempty"`
	Password string `json:"password" validate:"required"`
}

// SendOTPRequest is the input for requesting a verification or login OTP.
type SendOTPRequest struct {
	Phone string `json:"phone" validate:"required"`
}

// AuthResponse is returned on successful auth (register/login/refresh).
type AuthResponse struct {
	AccessToken  string             `json:"accessToken"`
	RefreshToken string             `json:"refreshToken"`
	ExpiresIn    int                `json:"expiresIn"` // seconds
	User         user.PublicProfile `json:"user"`
	Tenant       *tenant.Tenant     `json:"tenant"`
}

// ─── Service ──────────────────────────────────────────────────────────────────

// Service handles all authentication business logic.
type Service struct {
	mongo       *mongoinfra.Client
	redis       *redisinfra.Client
	tokenMaker  *token.Maker
	otpProvider otp.OTPProvider
	emailSvc    EmailSender
}

// EmailSender is an interface for sending transactional emails.
type EmailSender interface {
	SendOTP(ctx context.Context, to, name, code string) error
	SendWelcome(ctx context.Context, to, name, businessName string) error
	SendPasswordReset(ctx context.Context, to, name, resetLink string) error
	SendInvite(ctx context.Context, to, inviterName, businessName, inviteLink string) error
}

// NewService creates a new auth service.
func NewService(
	mongoClient *mongoinfra.Client,
	redisClient *redisinfra.Client,
	tokenMaker *token.Maker,
	otpProvider otp.OTPProvider,
	emailSvc EmailSender,
) *Service {
	return &Service{
		mongo:       mongoClient,
		redis:       redisClient,
		tokenMaker:  tokenMaker,
		otpProvider: otpProvider,
		emailSvc:    emailSvc,
	}
}

// Register creates a new tenant and owner user, then sends an OTP.
func (s *Service) Register(ctx context.Context, req RegisterRequest) (string, error) {
	tenantsColl := s.mongo.Collection("tenants")
	usersColl := s.mongo.Collection("users")

	phone := otp.NormalizePhone(req.Phone)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	// Validation: phone must be valid if provided, or if phone is empty, email must be valid
	if phone == "" && email == "" {
		return "", ErrInvalidPhone
	}
	if phone != "" && len(phone) < 10 {
		return "", ErrInvalidPhone
	}

	// Resolve user name
	name := strings.TrimSpace(req.Name)
	if name == "" {
		name = strings.TrimSpace(req.FirstName + " " + req.LastName)
	}
	if name == "" {
		name = "Owner"
	}

	timezone := req.Timezone
	if timezone == "" {
		timezone = "Asia/Kolkata"
	}

	country := req.Country
	if country == "" {
		country = "IN"
	}

	// Check if user with phone already exists
	if phone != "" {
		var existingUser user.User
		err := usersColl.FindOne(ctx, bson.M{"phone": phone}).Decode(&existingUser)
		if err == nil {
			if existingUser.Auth.PhoneVerified {
				return "", ErrPhoneAlreadyExists
			}
			// If unverified, resend OTP
			otpCode, err := s.otpProvider.SendOTP(ctx, phone)
			if err != nil {
				return "", fmt.Errorf("register: resend otp: %w", err)
			}
			log.Printf("🔑 [AUTH OTP] Resent for unverified user %s (provider: %s): %s", phone, s.otpProvider.Name(), otpCode)
			return otpCode, nil
		}
	} else if email != "" {
		var existingUser user.User
		err := usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
		if err == nil {
			if existingUser.Auth.EmailVerified {
				return "", ErrEmailAlreadyExists
			}
		}
	}

	// Generate tenant slug from business name
	slug := generateSlug(req.BusinessName)
	if slug == "" {
		slug = "restaurant"
	}
	slug, err := s.ensureUniqueSlug(ctx, tenantsColl, slug)
	if err != nil {
		return "", fmt.Errorf("register: slug: %w", err)
	}

	// Hash password
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("register: hash password: %w", err)
	}

	// Build tenant with Growth plan trial features
	plan := tenant.PlanGrowth // 14-day trial on Growth
	now := time.Now().UTC()
	newTenant := tenant.Tenant{
		ID:           bson.NewObjectID(),
		Slug:         slug,
		Name:         req.BusinessName,
		BusinessType: req.BusinessType,
		Plan:         plan,
		Status:       tenant.StatusActive,
		Timezone:     timezone,
		Currency:     "INR",
		Country:      country,
		TaxRate:      0,
		Contact: tenant.Contact{
			Email: email,
			Phone: phone,
		},
		Settings: tenant.Settings{
			OrderingEnabled:        true,
			RequireGuestPhone:      false,
			AutoAcceptOrders:       false,
			PreparationTimeMinutes: 15,
			OrderingPageTheme:      "default",
			ItemUnavailableMode:    "gray_out",
		},
		Features:   tenant.FeaturesForPlan(plan),
		Limits:     tenant.LimitsForPlan(plan),
		Onboarding: tenant.Onboarding{Completed: false},
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	// Build owner user (unverified until OTP confirmed)
	newUser := user.User{
		ID:          bson.NewObjectID(),
		TenantID:    newTenant.ID,
		Phone:       phone,
		Email:       email,
		Name:        name,
		Role:        user.RoleOwner,
		Permissions: user.DefaultPermissionsForRole(user.RoleOwner),
		Auth: user.Auth{
			PasswordHash:  string(passwordHash),
			EmailVerified: false,
			PhoneVerified: false,
		},
		Status:    user.StatusInvited, // becomes Active after OTP
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert tenant
	log.Printf("📦 [AUTH] Inserting tenant slug=%s for user phone=%s", slug, phone)
	if _, err := tenantsColl.InsertOne(ctx, newTenant); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			if strings.Contains(err.Error(), "idx_email") || strings.Contains(err.Error(), "email") {
				return "", ErrEmailAlreadyExists
			}
			return "", ErrSlugAlreadyExists
		}
		log.Printf("❌ [AUTH] InsertOne tenant failed: %v", err)
		return "", fmt.Errorf("register: insert tenant: %w", err)
	}

	// Insert user
	if _, err := usersColl.InsertOne(ctx, newUser); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			// Phone or email index collision — roll back tenant insert
			_, _ = tenantsColl.DeleteOne(ctx, bson.M{"_id": newTenant.ID})
			if strings.Contains(err.Error(), "idx_tenant_email") || strings.Contains(err.Error(), "email") {
				return "", ErrEmailAlreadyExists
			}
			return "", ErrPhoneAlreadyExists
		}
		// Roll back tenant on any user insert failure
		_, _ = tenantsColl.DeleteOne(ctx, bson.M{"_id": newTenant.ID})
		log.Printf("❌ [AUTH] InsertOne user failed: %v", err)
		return "", fmt.Errorf("register: insert user: %w", err)
	}

	// Send OTP via OTPProvider
	targetIdentifier := phone
	if targetIdentifier == "" {
		targetIdentifier = email
	}
	otpCode, err := s.otpProvider.SendOTP(ctx, targetIdentifier)
	if err != nil {
		return "", fmt.Errorf("register: send otp: %w", err)
	}

	log.Printf("🔑 [AUTH OTP] Sent for new user %s (provider: %s): %s", targetIdentifier, s.otpProvider.Name(), otpCode)

	if email != "" {
		_ = s.emailSvc.SendOTP(ctx, email, newUser.Name, otpCode)
	}

	return otpCode, nil
}

// VerifyOTP confirms the OTP and activates the user account, returning tokens.
func (s *Service) VerifyOTP(ctx context.Context, req VerifyOTPRequest) (*AuthResponse, error) {
	phone := otp.NormalizePhone(req.Phone)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	code := strings.TrimSpace(req.OTP)
	if code == "" {
		code = strings.TrimSpace(req.Code)
	}
	if code == "" {
		return nil, ErrInvalidOTP
	}

	targetIdentifier := phone
	if targetIdentifier == "" {
		targetIdentifier = email
	}
	if targetIdentifier == "" {
		return nil, ErrInvalidPhone
	}

	// Verify OTP via Provider
	valid, err := s.otpProvider.VerifyOTP(ctx, targetIdentifier, code)
	if err != nil {
		return nil, fmt.Errorf("verify-otp: %w", err)
	}
	if !valid {
		return nil, ErrInvalidOTP
	}

	// Find user by phone, or fallback to email
	usersColl := s.mongo.Collection("users")
	var u user.User
	var filter bson.M
	if phone != "" {
		filter = bson.M{"phone": phone}
	} else {
		filter = bson.M{"email": email}
	}

	if err := usersColl.FindOne(ctx, filter).Decode(&u); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			if email != "" && phone != "" {
				if err2 := usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&u); err2 != nil {
					return nil, ErrInvalidCredentials
				}
			} else {
				return nil, ErrInvalidCredentials
			}
		} else {
			return nil, fmt.Errorf("verify-otp: find user: %w", err)
		}
	}

	// Activate user
	now := time.Now().UTC()
	_, _ = usersColl.UpdateOne(ctx, bson.M{"_id": u.ID}, bson.M{
		"$set": bson.M{
			"auth.phoneVerified": true,
			"auth.emailVerified": true,
			"status":             string(user.StatusActive),
			"updatedAt":          now,
		},
	})
	u.Auth.PhoneVerified = true
	u.Auth.EmailVerified = true
	u.Status = user.StatusActive

	// Load tenant
	tenantsColl := s.mongo.Collection("tenants")
	var t tenant.Tenant
	if err := tenantsColl.FindOne(ctx, bson.M{"_id": u.TenantID}).Decode(&t); err != nil {
		return nil, fmt.Errorf("verify-otp: find tenant: %w", err)
	}

	// Issue tokens
	return s.issueTokenPair(ctx, &u, &t)
}

// Login authenticates with mobile number/email + password and returns tokens.
func (s *Service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	phone := otp.NormalizePhone(req.Phone)
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if phone == "" && email == "" {
		return nil, ErrInvalidCredentials
	}

	usersColl := s.mongo.Collection("users")
	var u user.User
	var err error

	if phone != "" {
		err = usersColl.FindOne(ctx, bson.M{"phone": phone}).Decode(&u)
		if err != nil && errors.Is(err, mongo.ErrNoDocuments) && email != "" {
			err = usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&u)
		}
	} else {
		err = usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&u)
	}

	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("login: find user: %w", err)
	}

	// Check account lock
	if u.IsLocked() {
		return nil, ErrAccountLocked
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(u.Auth.PasswordHash), []byte(req.Password)); err != nil {
		s.incrementFailedAttempts(ctx, usersColl, u.ID)
		return nil, ErrInvalidCredentials
	}

	// Reset failed attempts on success
	now := time.Now().UTC()
	_, _ = usersColl.UpdateOne(ctx, bson.M{"_id": u.ID}, bson.M{
		"$set": bson.M{
			"auth.failedLoginAttempts": 0,
			"auth.lockedUntil":         nil,
			"auth.lastLoginAt":         now,
			"updatedAt":                now,
		},
	})

	// Load tenant
	tenantsColl := s.mongo.Collection("tenants")
	var t tenant.Tenant
	if err := tenantsColl.FindOne(ctx, bson.M{"_id": u.TenantID}).Decode(&t); err != nil {
		return nil, fmt.Errorf("login: find tenant: %w", err)
	}

	return s.issueTokenPair(ctx, &u, &t)
}

// ResendOTP sends a fresh OTP to the given phone number.
func (s *Service) ResendOTP(ctx context.Context, phone string) (string, error) {
	normPhone := otp.NormalizePhone(phone)
	if normPhone == "" {
		return "", ErrInvalidPhone
	}
	return s.otpProvider.SendOTP(ctx, normPhone)
}

// SendLoginOTP generates an OTP for passwordless login if user exists.
func (s *Service) SendLoginOTP(ctx context.Context, phone string) (string, error) {
	normPhone := otp.NormalizePhone(phone)
	if normPhone == "" {
		return "", ErrInvalidPhone
	}

	usersColl := s.mongo.Collection("users")
	var u user.User
	if err := usersColl.FindOne(ctx, bson.M{"phone": normPhone}).Decode(&u); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return "", ErrInvalidCredentials
		}
		return "", err
	}

	return s.otpProvider.SendOTP(ctx, normPhone)
}

// RefreshTokens validates a refresh token and issues a new token pair.
func (s *Service) RefreshTokens(ctx context.Context, refreshTokenStr string) (*AuthResponse, error) {
	claims, err := s.tokenMaker.VerifyRefreshToken(refreshTokenStr)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// Check Redis: token must exist (not revoked)
	_, err = s.redis.GetRefreshToken(ctx, claims.TokenID)
	if err != nil {
		return nil, ErrInvalidRefreshToken
	}

	// Revoke old refresh token (rotation)
	_ = s.redis.RevokeRefreshToken(ctx, claims.TokenID)

	// Load user and tenant
	usersColl := s.mongo.Collection("users")
	tenantsColl := s.mongo.Collection("tenants")

	userOID, _ := bson.ObjectIDFromHex(claims.UserID)
	var u user.User
	if err := usersColl.FindOne(ctx, bson.M{"_id": userOID}).Decode(&u); err != nil {
		return nil, ErrInvalidRefreshToken
	}

	var t tenant.Tenant
	if err := tenantsColl.FindOne(ctx, bson.M{"_id": u.TenantID}).Decode(&t); err != nil {
		return nil, ErrInvalidRefreshToken
	}

	return s.issueTokenPair(ctx, &u, &t)
}

// Logout revokes the provided refresh token's JTI.
func (s *Service) Logout(ctx context.Context, tokenID string) error {
	return s.redis.RevokeRefreshToken(ctx, tokenID)
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

// issueTokenPair creates a new access + refresh token pair and stores the
// refresh token's JTI in Redis.
func (s *Service) issueTokenPair(ctx context.Context, u *user.User, t *tenant.Tenant) (*AuthResponse, error) {
	userID := u.ID.Hex()
	tenantID := u.TenantID.Hex()
	role := string(u.Role)

	accessToken, accessClaims, err := s.tokenMaker.CreateAccessToken(userID, tenantID, role)
	if err != nil {
		return nil, fmt.Errorf("issue tokens: access: %w", err)
	}

	refreshToken, refreshClaims, err := s.tokenMaker.CreateRefreshToken(userID, tenantID, role)
	if err != nil {
		return nil, fmt.Errorf("issue tokens: refresh: %w", err)
	}

	// Store refresh token JTI in Redis
	ttl := time.Until(refreshClaims.ExpiresAt.Time)
	if err := s.redis.SetRefreshToken(ctx, refreshClaims.TokenID, userID, ttl); err != nil {
		return nil, fmt.Errorf("issue tokens: store refresh: %w", err)
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int(time.Until(accessClaims.ExpiresAt.Time).Seconds()),
		User:         u.ToPublic(),
		Tenant:       t,
	}, nil
}

// incrementFailedAttempts increases the failed login counter and locks the account after max attempts.
func (s *Service) incrementFailedAttempts(ctx context.Context, coll *mongo.Collection, userID bson.ObjectID) {
	now := time.Now().UTC()
	update := bson.M{
		"$inc": bson.M{"auth.failedLoginAttempts": 1},
		"$set": bson.M{"updatedAt": now},
	}

	// Lock account after max attempts for 15 minutes
	var u user.User
	_ = coll.FindOne(ctx, bson.M{"_id": userID}).Decode(&u)
	if u.Auth.FailedLoginAttempts+1 >= maxFailedAttempts {
		lockUntil := now.Add(15 * time.Minute)
		update["$set"].(bson.M)["auth.lockedUntil"] = lockUntil
	}

	_, _ = coll.UpdateOne(ctx, bson.M{"_id": userID}, update)
}

// generateSlug converts a business name to a URL-safe slug.
func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	// Remove non-alphanumeric characters except hyphens
	var result []rune
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result = append(result, r)
		}
	}
	// Trim leading/trailing hyphens
	return strings.Trim(string(result), "-")
}

// ensureUniqueSlug appends a random suffix if the desired slug is already taken.
func (s *Service) ensureUniqueSlug(ctx context.Context, coll *mongo.Collection, base string) (string, error) {
	slug := base
	for i := 0; i < 5; i++ {
		count, err := coll.CountDocuments(ctx, bson.M{"slug": slug})
		if err != nil {
			return "", err
		}
		if count == 0 {
			return slug, nil
		}
		// Append short UUID suffix
		slug = base + "-" + uuid.NewString()[:6]
	}
	return "", ErrSlugAlreadyExists
}
