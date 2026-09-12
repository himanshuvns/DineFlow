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
	ErrInvalidCredentials   = errors.New("invalid email or password")
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
	Email        string              `json:"email" validate:"required,email"`
	Password     string              `json:"password" validate:"required,min=8"`
	Name         string              `json:"name"`
	FirstName    string              `json:"firstName,omitempty"`
	LastName     string              `json:"lastName,omitempty"`
	Timezone     string              `json:"timezone"`
	Country      string              `json:"country"`
}

// VerifyOTPRequest is the input for OTP verification.
type VerifyOTPRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp"`
	Code  string `json:"code,omitempty"`
}

// LoginRequest is the input for email/password login.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse is returned on successful auth (register/login/refresh).
type AuthResponse struct {
	AccessToken  string          `json:"accessToken"`
	RefreshToken string          `json:"refreshToken"`
	ExpiresIn    int             `json:"expiresIn"` // seconds
	User         user.PublicProfile `json:"user"`
	Tenant       *tenant.Tenant  `json:"tenant"`
}

// ─── Service ──────────────────────────────────────────────────────────────────

// Service handles all authentication business logic.
type Service struct {
	mongo      *mongoinfra.Client
	redis      *redisinfra.Client
	tokenMaker *token.Maker
	otpSvc     *otp.Service
	emailSvc   EmailSender
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
	otpSvc *otp.Service,
	emailSvc EmailSender,
) *Service {
	return &Service{
		mongo:      mongoClient,
		redis:      redisClient,
		tokenMaker: tokenMaker,
		otpSvc:     otpSvc,
		emailSvc:   emailSvc,
	}
}

// Register creates a new tenant and owner user, then sends an OTP.
func (s *Service) Register(ctx context.Context, req RegisterRequest) (string, error) {
	tenantsColl := s.mongo.Collection("tenants")
	usersColl := s.mongo.Collection("users")

	email := strings.ToLower(strings.TrimSpace(req.Email))

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

	// Check if user already exists
	var existingUser user.User
	err := usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&existingUser)
	if err == nil {
		// If already verified, reject duplicate
		if existingUser.Auth.EmailVerified {
			return "", ErrEmailAlreadyExists
		}
		// If unverified, generate fresh OTP and let them verify
		otpCode, err := s.otpSvc.Generate(ctx, email)
		if err != nil {
			return "", fmt.Errorf("register: generate otp: %w", err)
		}
		log.Printf("🔑 [AUTH DEV OTP] Resent for unverified user %s: %s", email, otpCode)
		if err := s.emailSvc.SendOTP(ctx, email, existingUser.Name, otpCode); err != nil {
			_ = err
		}
		return otpCode, nil
	}

	// Generate tenant slug from business name
	slug := generateSlug(req.BusinessName)
	slug, err = s.ensureUniqueSlug(ctx, tenantsColl, slug)
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
		Contact:      tenant.Contact{Email: email},
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
		Email:       email,
		Name:        name,
		Role:        user.RoleOwner,
		Permissions: user.DefaultPermissionsForRole(user.RoleOwner),
		Auth: user.Auth{
			PasswordHash:  string(passwordHash),
			EmailVerified: false,
		},
		Status:    user.StatusInvited, // becomes Active after OTP
		CreatedAt: now,
		UpdatedAt: now,
	}

	// Insert tenant
	if _, err := tenantsColl.InsertOne(ctx, newTenant); err != nil {
		return "", fmt.Errorf("register: insert tenant: %w", err)
	}

	// Insert user
	if _, err := usersColl.InsertOne(ctx, newUser); err != nil {
		return "", fmt.Errorf("register: insert user: %w", err)
	}

	// Generate and send OTP
	otpCode, err := s.otpSvc.Generate(ctx, email)
	if err != nil {
		return "", fmt.Errorf("register: generate otp: %w", err)
	}

	log.Printf("🔑 [AUTH DEV OTP] Generated for new user %s: %s", email, otpCode)

	if err := s.emailSvc.SendOTP(ctx, email, newUser.Name, otpCode); err != nil {
		// Non-fatal: user was created, OTP will be re-sent on retry
		_ = err
	}

	return otpCode, nil
}

// VerifyOTP confirms the OTP and activates the user account, returning tokens.
func (s *Service) VerifyOTP(ctx context.Context, req VerifyOTPRequest) (*AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	code := strings.TrimSpace(req.OTP)
	if code == "" {
		code = strings.TrimSpace(req.Code)
	}
	if code == "" {
		return nil, ErrInvalidOTP
	}

	// Verify OTP
	valid, err := s.otpSvc.Verify(ctx, email, code)
	if err != nil {
		return nil, fmt.Errorf("verify-otp: redis: %w", err)
	}
	if !valid {
		return nil, ErrInvalidOTP
	}

	// Find user
	usersColl := s.mongo.Collection("users")
	var u user.User
	if err := usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&u); err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("verify-otp: find user: %w", err)
	}

	// Activate user
	now := time.Now().UTC()
	_, _ = usersColl.UpdateOne(ctx, bson.M{"_id": u.ID}, bson.M{
		"$set": bson.M{
			"auth.emailVerified": true,
			"status":             string(user.StatusActive),
			"updatedAt":          now,
		},
	})

	// Load tenant
	tenantsColl := s.mongo.Collection("tenants")
	var t tenant.Tenant
	if err := tenantsColl.FindOne(ctx, bson.M{"_id": u.TenantID}).Decode(&t); err != nil {
		return nil, fmt.Errorf("verify-otp: find tenant: %w", err)
	}

	// Issue tokens
	return s.issueTokenPair(ctx, &u, &t)
}

// Login authenticates with email + password and returns tokens.
func (s *Service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	usersColl := s.mongo.Collection("users")
	var u user.User
	if err := usersColl.FindOne(ctx, bson.M{"email": email}).Decode(&u); err != nil {
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
		// Increment failed attempt counter
		s.incrementFailedAttempts(ctx, usersColl, u.ID)
		return nil, ErrInvalidCredentials
	}

	// Reset failed attempts on success
	now := time.Now().UTC()
	_, _ = usersColl.UpdateOne(ctx, bson.M{"_id": u.ID}, bson.M{
		"$set": bson.M{
			"auth.failedLoginAttempts": 0,
			"auth.lockedUntil":         nil,
			"auth.lastLoginAt":          now,
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
