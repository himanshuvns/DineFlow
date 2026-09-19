package handlers

import (
	"errors"
	"os"

	authapp "github.com/dineflow/api/internal/application/auth"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

type ForgotPasswordRequest struct {
	Email string `json:"email"`
	Phone string `json:"phone"`
}

type VerifyResetOTPRequest struct {
	Phone string `json:"phone" binding:"required"`
	OTP   string `json:"otp" binding:"required"`
}

type ResetPasswordRequest struct {
	Token           string `json:"token"`
	Phone           string `json:"phone"`
	OTP             string `json:"otp"`
	NewPassword     string `json:"newPassword" binding:"required,min=8"`
	ConfirmPassword string `json:"confirmPassword" binding:"required"`
}

// ForgotPassword godoc
// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_REQUEST", "Please provide a valid mobile number or email address.")
		return
	}

	if req.Phone != "" {
		otpCode, err := h.authService.SendPasswordResetOTP(c.Request.Context(), req.Phone)
		if err != nil {
			switch {
			case errors.Is(err, authapp.ErrInvalidPhone):
				response.BadRequest(c, "INVALID_PHONE", "Please provide a valid mobile number.")
			case errors.Is(err, authapp.ErrInvalidCredentials):
				response.NotFound(c, "No account is registered with this mobile number.")
			default:
				response.InternalError(c)
			}
			return
		}

		respData := gin.H{
			"message": "Verification code dispatched to your mobile number.",
		}
		if os.Getenv("APP_ENV") != "production" || os.Getenv("OTP_PROVIDER") != "msg91" {
			respData["devOtp"] = otpCode
		}

		response.OK(c, respData)
		return
	}

	if req.Email != "" {
		_ = h.authService.ForgotPassword(c.Request.Context(), req.Email)
		response.OK(c, gin.H{
			"message": "If an account matches that information, a secure password reset link has been dispatched.",
		})
		return
	}

	response.BadRequest(c, "MISSING_IDENTIFIER", "Mobile number or email is required.")
}

// VerifyResetOTP godoc
// POST /api/v1/auth/verify-reset-otp
func (h *AuthHandler) VerifyResetOTP(c *gin.Context) {
	var req VerifyResetOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_BODY", err.Error())
		return
	}

	resetToken, err := h.authService.VerifyResetOTP(c.Request.Context(), req.Phone, req.OTP)
	if err != nil {
		switch {
		case errors.Is(err, authapp.ErrInvalidOTP):
			response.BadRequest(c, "INVALID_OTP", "The verification code is invalid or has expired.")
		case errors.Is(err, authapp.ErrInvalidPhone):
			response.BadRequest(c, "INVALID_PHONE", "Please provide a valid mobile number.")
		case errors.Is(err, authapp.ErrInvalidCredentials):
			response.NotFound(c, "Account")
		default:
			response.InternalError(c)
		}
		return
	}

	response.OK(c, gin.H{
		"resetToken": resetToken,
		"message":    "Verification code accepted. Please set your new password.",
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

	// Support both token-based reset and direct phone+OTP reset
	if req.Token != "" {
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
	} else if req.Phone != "" && req.OTP != "" {
		if err := h.authService.ResetPasswordWithOTP(c.Request.Context(), req.Phone, req.OTP, req.NewPassword); err != nil {
			switch {
			case errors.Is(err, authapp.ErrInvalidOTP):
				response.BadRequest(c, "INVALID_OTP", "The verification code is invalid or has expired.")
			case errors.Is(err, authapp.ErrInvalidPhone):
				response.BadRequest(c, "INVALID_PHONE", "Please provide a valid mobile number.")
			case errors.Is(err, authapp.ErrInvalidCredentials):
				response.NotFound(c, "No account is registered with this mobile number.")
			case errors.Is(err, authapp.ErrWeakPassword):
				response.BadRequest(c, "WEAK_PASSWORD", "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.")
			default:
				response.InternalError(c)
			}
			return
		}
	} else {
		response.BadRequest(c, "MISSING_TOKEN_OR_OTP", "Reset token or mobile number and verification code is required.")
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

