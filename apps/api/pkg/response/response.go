package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// APIResponse is the standard JSON envelope for all API responses.
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Meta    *Meta       `json:"meta,omitempty"`
	Error   *APIError   `json:"error"`
}

// Meta holds pagination and other response metadata.
type Meta struct {
	Page    int   `json:"page,omitempty"`
	Limit   int   `json:"limit,omitempty"`
	Total   int64 `json:"total,omitempty"`
	HasMore bool  `json:"hasMore,omitempty"`
}

// APIError is the structured error payload.
type APIError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Field   string `json:"field,omitempty"`
}

// ─── Success Helpers ──────────────────────────────────────────────────────────

// OK sends a 200 success response.
func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, APIResponse{Success: true, Data: data})
}

// OKWithMeta sends a 200 success response with pagination metadata.
func OKWithMeta(c *gin.Context, data interface{}, meta *Meta) {
	c.JSON(http.StatusOK, APIResponse{Success: true, Data: data, Meta: meta})
}

// Created sends a 201 response for successful resource creation.
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, APIResponse{Success: true, Data: data})
}

// NoContent sends a 204 response (no body).
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

// ─── Error Helpers ────────────────────────────────────────────────────────────

// BadRequest sends a 400 error response.
func BadRequest(c *gin.Context, code, message string) {
	c.AbortWithStatusJSON(http.StatusBadRequest, APIResponse{
		Success: false,
		Error:   &APIError{Code: code, Message: message},
	})
}

// ValidationError sends a 422 validation error response with an optional field.
func ValidationError(c *gin.Context, field, message string) {
	c.AbortWithStatusJSON(http.StatusUnprocessableEntity, APIResponse{
		Success: false,
		Error:   &APIError{Code: "VALIDATION_ERROR", Message: message, Field: field},
	})
}

// Unauthorized sends a 401 response.
func Unauthorized(c *gin.Context, message string) {
	if message == "" {
		message = "Authentication required."
	}
	c.AbortWithStatusJSON(http.StatusUnauthorized, APIResponse{
		Success: false,
		Error:   &APIError{Code: "UNAUTHORIZED", Message: message},
	})
}

// Forbidden sends a 403 response.
func Forbidden(c *gin.Context, code, message string) {
	if message == "" {
		message = "You do not have permission to perform this action."
	}
	c.AbortWithStatusJSON(http.StatusForbidden, APIResponse{
		Success: false,
		Error:   &APIError{Code: code, Message: message},
	})
}

// NotFound sends a 404 response.
func NotFound(c *gin.Context, resource string) {
	c.AbortWithStatusJSON(http.StatusNotFound, APIResponse{
		Success: false,
		Error:   &APIError{Code: "NOT_FOUND", Message: resource + " not found."},
	})
}

// Conflict sends a 409 response for duplicate resource errors.
func Conflict(c *gin.Context, code, message string) {
	c.AbortWithStatusJSON(http.StatusConflict, APIResponse{
		Success: false,
		Error:   &APIError{Code: code, Message: message},
	})
}

// TooManyRequests sends a 429 rate limit response.
func TooManyRequests(c *gin.Context) {
	c.AbortWithStatusJSON(http.StatusTooManyRequests, APIResponse{
		Success: false,
		Error:   &APIError{Code: "RATE_LIMITED", Message: "Too many requests. Please slow down."},
	})
}

// InternalError sends a 500 response. Never exposes internal details to clients.
func InternalError(c *gin.Context) {
	c.AbortWithStatusJSON(http.StatusInternalServerError, APIResponse{
		Success: false,
		Error:   &APIError{Code: "INTERNAL_ERROR", Message: "An unexpected error occurred. Our team has been notified."},
	})
}

// PlanLimitExceeded sends a 403 with plan upgrade messaging.
func PlanLimitExceeded(c *gin.Context, resource string) {
	c.AbortWithStatusJSON(http.StatusForbidden, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    "PLAN_LIMIT_EXCEEDED",
			Message: "You have reached the " + resource + " limit for your current plan. Please upgrade to continue.",
		},
	})
}

// FeatureNotAvailable sends a 403 indicating a plan upgrade is needed.
func FeatureNotAvailable(c *gin.Context, feature string) {
	c.AbortWithStatusJSON(http.StatusForbidden, APIResponse{
		Success: false,
		Error: &APIError{
			Code:    "FEATURE_NOT_AVAILABLE",
			Message: "The " + feature + " feature is not available on your current plan.",
		},
	})
}
