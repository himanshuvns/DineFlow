package handlers

import (
	"errors"
	"log"
	"net/http"
	"strings"

	authapp "github.com/dineflow/api/internal/application/auth"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

// AuthHandler contains all HTTP handlers for auth endpoints.
type AuthHandler struct {
	authService *authapp.Service
}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler(authService *authapp.Service) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Register godoc
// POST /api/v1/auth/register
// Creates a new tenant + owner user and sends an email OTP.
func (h *AuthHandler) Register(c *gin.Context) {
	var req authapp.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", err.Error())
		return
	}

	_, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, authapp.ErrPhoneAlreadyExists):
			response.Conflict(c, "PHONE_EXISTS", "An account with this mobile number already exists.")
		case errors.Is(err, authapp.ErrEmailAlreadyExists):
			response.Conflict(c, "EMAIL_EXISTS", "An account with this email already exists.")
		case errors.Is(err, authapp.ErrInvalidEmail):
			response.BadRequest(c, "INVALID_EMAIL", "Please provide a valid email address.")
		case errors.Is(err, authapp.ErrInvalidPhone):
			response.BadRequest(c, "INVALID_PHONE", "Please provide a valid 10-digit mobile number.")
		case errors.Is(err, authapp.ErrSlugAlreadyExists):
			response.Conflict(c, "SLUG_EXISTS", "This business name is already taken. Please try a different name.")
		default:
			log.Printf("❌ [AUTH] Register unexpected error: %v", err)
			response.InternalError(c)
		}
		return
	}

	respData := gin.H{
		"message": "Registration successful. Please enter the 6-digit verification code sent to your email address.",
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    respData,
	})
}

// VerifyOTP godoc
// POST /api/v1/auth/verify-otp
// Verifies the OTP and activates the account, returning auth tokens.
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req authapp.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", err.Error())
		return
	}

	authResp, err := h.authService.VerifyOTP(c.Request.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, authapp.ErrInvalidOTP):
			response.BadRequest(c, "INVALID_OTP", "The verification code is invalid or has expired.")
		case errors.Is(err, authapp.ErrInvalidPhone):
			response.BadRequest(c, "INVALID_PHONE", "Please provide a valid mobile number.")
		case errors.Is(err, authapp.ErrInvalidEmail):
			response.BadRequest(c, "INVALID_EMAIL", "Please provide a valid email address.")
		case errors.Is(err, authapp.ErrInvalidCredentials):
			response.NotFound(c, "Account")
		default:
			response.InternalError(c)
		}
		return
	}

	// Set refresh token as HttpOnly cookie for web clients
	setRefreshTokenCookie(c, authResp.RefreshToken)

	response.Created(c, authResp)
}

// Login godoc
// POST /api/v1/auth/login
// Authenticates with mobile number/email + password.
func (h *AuthHandler) Login(c *gin.Context) {
	var req authapp.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", err.Error())
		return
	}

	authResp, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, authapp.ErrInvalidCredentials):
			response.Unauthorized(c, "Invalid mobile number or password.")
		case errors.Is(err, authapp.ErrAccountLocked):
			response.Forbidden(c, "ACCOUNT_LOCKED", "Your account is temporarily locked. Please try again in 15 minutes.")
		default:
			response.InternalError(c)
		}
		return
	}

	setRefreshTokenCookie(c, authResp.RefreshToken)
	response.OK(c, authResp)
}

// SendOTP godoc
// POST /api/v1/auth/send-otp
// Dispatches an OTP to a mobile number.
func (h *AuthHandler) SendOTP(c *gin.Context) {
	var req authapp.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", err.Error())
		return
	}

	_, err := h.authService.SendLoginOTP(c.Request.Context(), req.Phone)
	if err != nil {
		switch {
		case errors.Is(err, authapp.ErrInvalidPhone):
			response.BadRequest(c, "INVALID_PHONE", "Please provide a valid mobile number.")
		case errors.Is(err, authapp.ErrInvalidCredentials):
			response.NotFound(c, "Account")
		default:
			response.InternalError(c)
		}
		return
	}

	respData := gin.H{
		"message": "Verification code dispatched successfully.",
	}

	response.OK(c, respData)
}

// ResendOTP godoc
// POST /api/v1/auth/resend-otp
// Resends a fresh OTP to the given email address or mobile number.
func (h *AuthHandler) ResendOTP(c *gin.Context) {
	var req authapp.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", err.Error())
		return
	}

	target := strings.TrimSpace(req.Email)
	if target == "" {
		target = strings.TrimSpace(req.Phone)
	}
	if target == "" {
		response.BadRequest(c, "INVALID_TARGET", "Please provide a valid email address or mobile number.")
		return
	}

	_, err := h.authService.ResendOTP(c.Request.Context(), target)
	if err != nil {
		switch {
		case errors.Is(err, authapp.ErrInvalidPhone):
			response.BadRequest(c, "INVALID_PHONE", "Please provide a valid mobile number.")
		case errors.Is(err, authapp.ErrInvalidEmail):
			response.BadRequest(c, "INVALID_EMAIL", "Please provide a valid email address.")
		default:
			response.InternalError(c)
		}
		return
	}

	respData := gin.H{
		"message": "A new verification code has been dispatched.",
	}

	response.OK(c, respData)
}

// Refresh godoc
// POST /api/v1/auth/refresh
// Issues a new access token using the refresh token (from cookie or body).
func (h *AuthHandler) Refresh(c *gin.Context) {
	// Try cookie first (web), then Authorization header (mobile)
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil || refreshToken == "" {
		var body struct {
			RefreshToken string `json:"refreshToken"`
		}
		if err := c.ShouldBindJSON(&body); err != nil || body.RefreshToken == "" {
			response.Unauthorized(c, "Refresh token is required.")
			return
		}
		refreshToken = body.RefreshToken
	}

	authResp, err := h.authService.RefreshTokens(c.Request.Context(), refreshToken)
	if err != nil {
		// Clear bad cookie
		clearRefreshTokenCookie(c)
		response.Unauthorized(c, "Invalid or expired refresh token. Please log in again.")
		return
	}

	setRefreshTokenCookie(c, authResp.RefreshToken)
	response.OK(c, authResp)
}

// Logout godoc
// POST /api/v1/auth/logout
// Revokes the current refresh token and blacklists the access token.
func (h *AuthHandler) Logout(c *gin.Context) {
	tokenID := middleware.GetTokenID(c)
	if tokenID != "" {
		_ = h.authService.Logout(c.Request.Context(), tokenID)
	}
	clearRefreshTokenCookie(c)

	response.OK(c, gin.H{"message": "Logged out successfully."})
}

// LogoutAll godoc
// POST /api/v1/auth/logout-all
// Revokes all active sessions for the user across all devices.
func (h *AuthHandler) LogoutAll(c *gin.Context) {
	userID := middleware.GetUserID(c)
	tokenID := middleware.GetTokenID(c)
	if tokenID != "" {
		_ = h.authService.Logout(c.Request.Context(), tokenID)
	}
	if userID != "" {
		_ = h.authService.LogoutAllDevices(c.Request.Context(), userID)
	}
	clearRefreshTokenCookie(c)

	response.OK(c, gin.H{"message": "Logged out from all devices successfully."})
}

// Me godoc
// GET /api/v1/auth/me
// Returns the current authenticated user's profile.
func (h *AuthHandler) Me(c *gin.Context) {
	// For now return what's in the JWT claims — full user fetch in Phase 2
	response.OK(c, gin.H{
		"userId":   middleware.GetUserID(c),
		"tenantId": middleware.GetTenantID(c),
		"role":     middleware.GetRole(c),
	})
}

// ─── Cookie Helpers ───────────────────────────────────────────────────────────

func setRefreshTokenCookie(c *gin.Context, refreshToken string) {
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie(
		"refresh_token",
		refreshToken,
		30*24*60*60, // 30 days in seconds
		"/",         // root path so cookie is accessible
		"",          // domain — empty = current domain
		true,        // secure (HTTPS only in production)
		true,        // HttpOnly
	)
}

func clearRefreshTokenCookie(c *gin.Context) {
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("refresh_token", "", -1, "/", "", true, true)
}
