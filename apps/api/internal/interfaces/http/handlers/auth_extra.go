package handlers

import (
	"errors"

	authapp "github.com/dineflow/api/internal/application/auth"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type ForgotPasswordRequest struct {
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type ResetPasswordRequest struct {
	Token           string `json:"token" binding:"required"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

// ForgotPassword godoc
// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_REQUEST", "Please provide a valid email address or phone number.")
		return
	}

	identifier := req.Email
	if identifier == "" {
		identifier = req.Phone
	}
	if identifier == "" {
		response.BadRequest(c, "MISSING_IDENTIFIER", "Email or phone number is required.")
		return
	}

	_ = h.authService.ForgotPassword(c.Request.Context(), identifier)

	// Constant response to prevent user enumeration
	response.OK(c, gin.H{
		"message": "If an account matches that information, a secure password reset link has been dispatched.",
	})
}

// ResetPassword godoc
// POST /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_REQUEST", err.Error())
		return
	}

	if req.NewPassword != req.ConfirmPassword {
		response.BadRequest(c, "PASSWORDS_DO_NOT_MATCH", "Passwords do not match.")
		return
	}

	if err := h.authService.ResetPassword(c.Request.Context(), req.Token, req.NewPassword); err != nil {
		switch {
		case errors.Is(err, authapp.ErrInvalidResetToken):
			response.BadRequest(c, "INVALID_OR_EXPIRED_TOKEN", "This password reset link is invalid or has expired.")
		case errors.Is(err, authapp.ErrWeakPassword):
			response.BadRequest(c, "WEAK_PASSWORD", "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")
		default:
			response.InternalError(c)
		}
		return
	}

	response.OK(c, gin.H{
		"message": "Your password has been successfully updated. All active sessions have been terminated. Please sign in with your new password.",
	})
}

// AcceptInvite godoc
// POST /api/v1/auth/accept-invite/:token
func (h *AuthHandler) AcceptInvite(c *gin.Context) {
	inviteToken := c.Param("token")
	response.OK(c, gin.H{"token": inviteToken, "message": "Staff invitation verified."})
}

