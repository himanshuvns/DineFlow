package middleware

import (
	"github.com/dineflow/api/internal/domain/user"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

// RequireRole returns a middleware that enforces one of the allowed roles.
// The Auth middleware must run before this.
//
// Example:
//
//	router.DELETE("/staff/:id", middleware.RequireRole("owner"), handlers.DeleteStaff)
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	allowed := make(map[string]bool, len(allowedRoles))
	for _, r := range allowedRoles {
		allowed[r] = true
	}

	return func(c *gin.Context) {
		role := GetRole(c)
		if role == "" {
			response.Unauthorized(c, "")
			return
		}
		if !allowed[role] {
			response.Forbidden(c, "INSUFFICIENT_ROLE",
				"Your role does not have permission to perform this action.")
			return
		}
		c.Next()
	}
}

// RequireAnyRole is an alias for RequireRole with more descriptive name.
func RequireAnyRole(roles ...string) gin.HandlerFunc {
	return RequireRole(roles...)
}

// ─── Role Hierarchy Helpers ───────────────────────────────────────────────────

// OwnerOnly restricts to owners.
func OwnerOnly() gin.HandlerFunc {
	return RequireRole(string(user.RoleOwner))
}

// OwnerOrManager restricts to owners and managers.
func OwnerOrManager() gin.HandlerFunc {
	return RequireRole(string(user.RoleOwner), string(user.RoleManager))
}

// ChefOrAbove restricts to chefs, managers, and owners.
func ChefOrAbove() gin.HandlerFunc {
	return RequireRole(
		string(user.RoleOwner),
		string(user.RoleManager),
		string(user.RoleChef),
	)
}

// WaiterOrAbove allows all authenticated staff roles.
func WaiterOrAbove() gin.HandlerFunc {
	return RequireRole(
		string(user.RoleOwner),
		string(user.RoleManager),
		string(user.RoleChef),
		string(user.RoleWaiter),
		string(user.RoleCashier),
	)
}
