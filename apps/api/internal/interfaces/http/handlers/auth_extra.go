// Additional auth handler methods that stub out forgot/reset password and invite acceptance.
// Full implementations are in Phase 2.
package handlers

import (
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

// ForgotPassword godoc
// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	response.OK(c, gin.H{"message": "Password reset email sent. Implemented fully in Phase 2."})
}

// ResetPassword godoc
// POST /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	response.OK(c, gin.H{"message": "Implemented in Phase 2."})
}

// AcceptInvite godoc
// POST /api/v1/auth/accept-invite/:token
func (h *AuthHandler) AcceptInvite(c *gin.Context) {
	inviteToken := c.Param("token")
	response.OK(c, gin.H{"token": inviteToken, "message": "Implemented in Phase 2."})
}
