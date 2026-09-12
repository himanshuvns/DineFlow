package handlers

import (
	"github.com/dineflow/api/internal/infrastructure/storage"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
)

// StorageHandler handles upload URL presigning.
type StorageHandler struct {
	storageService storage.StorageService
}

// NewStorageHandler creates a new StorageHandler.
func NewStorageHandler(s storage.StorageService) *StorageHandler {
	return &StorageHandler{storageService: s}
}

// PresignRequest defines payload for requesting an upload URL.
type PresignRequest struct {
	FileName    string `json:"fileName" binding:"required"`
	ContentType string `json:"contentType" binding:"required"`
	Size        int64  `json:"size" binding:"required"`
}

// Presign generates a presigned upload URL scoped to the authenticated tenant.
func (h *StorageHandler) Presign(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}

	var req PresignRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", "invalid payload: "+err.Error())
		return
	}

	res, err := h.storageService.PresignUpload(c.Request.Context(), tenantID, req.FileName, req.ContentType, req.Size)
	if err != nil {
		response.BadRequest(c, "STORAGE_ERROR", err.Error())
		return
	}

	response.OK(c, res)
}
