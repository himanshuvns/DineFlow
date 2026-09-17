package handlers

import (
	"strings"

	appsearch "github.com/dineflow/api/internal/application/search"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type SearchHandler struct {
	searchService *appsearch.Service
}

func NewSearchHandler(s *appsearch.Service) *SearchHandler {
	return &SearchHandler{searchService: s}
}

// Search handles GET /api/v1/search?q={query}
func (h *SearchHandler) Search(c *gin.Context) {
	tenantID := middleware.GetTenantID(c)
	if tenantID == "" {
		response.Unauthorized(c, "tenant context missing")
		return
	}
	tOID, err := bson.ObjectIDFromHex(tenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	q := strings.TrimSpace(c.Query("q"))
	if len(q) < 2 {
		response.OK(c, &appsearch.SearchResponse{
			Query: q,
			Results: appsearch.SearchResultsGrouped{
				Menu:       []appsearch.SearchResultItem{},
				Orders:     []appsearch.SearchResultItem{},
				Rooms:      []appsearch.SearchResultItem{},
				Customers:  []appsearch.SearchResultItem{},
				Tables:     []appsearch.SearchResultItem{},
				Staff:      []appsearch.SearchResultItem{},
				Categories: []appsearch.SearchResultItem{},
			},
			Total: 0,
		})
		return
	}

	res, err := h.searchService.SearchAll(c.Request.Context(), tOID, q)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, res)
}
