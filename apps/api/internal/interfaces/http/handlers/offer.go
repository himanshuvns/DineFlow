package handlers

import (
	"time"

	appoffer "github.com/dineflow/api/internal/application/offer"
	domainoffer "github.com/dineflow/api/internal/domain/offer"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/response"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type OfferHandler struct {
	offerService *appoffer.Service
}

func NewOfferHandler(s *appoffer.Service) *OfferHandler {
	return &OfferHandler{offerService: s}
}

// CreateOffer godoc
// POST /api/v1/offers
func (h *OfferHandler) CreateOffer(c *gin.Context) {
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

	var req struct {
		Title          string                     `json:"title" binding:"required"`
		Message        string                     `json:"message" binding:"required"`
		PromoCode      string                     `json:"promoCode" binding:"required"`
		DiscountType   domainoffer.DiscountType   `json:"discountType" binding:"required"`
		DiscountValue  float64                    `json:"discountValue" binding:"required"`
		TargetAudience domainoffer.TargetAudience `json:"targetAudience"`
		Channels       []string                   `json:"channels"`
		DeepLinkURL    string                     `json:"deepLinkUrl"`
		MinOrderValue  float64                    `json:"minOrderValue"`
		ExpiresAt      *time.Time                 `json:"expiresAt"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	off := &domainoffer.Offer{
		Title:          req.Title,
		Message:        req.Message,
		PromoCode:      req.PromoCode,
		DiscountType:   req.DiscountType,
		DiscountValue:  req.DiscountValue,
		TargetAudience: req.TargetAudience,
		Channels:       req.Channels,
		DeepLinkURL:    req.DeepLinkURL,
		MinOrderValue:  req.MinOrderValue,
		ExpiresAt:      req.ExpiresAt,
	}

	created, err := h.offerService.CreateOffer(c.Request.Context(), tOID, off)
	if err != nil {
		response.BadRequest(c, "CREATE_FAILED", err.Error())
		return
	}

	response.Created(c, created)
}

// ListOffers godoc
// GET /api/v1/offers
func (h *OfferHandler) ListOffers(c *gin.Context) {
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

	offers, err := h.offerService.ListOffers(c.Request.Context(), tOID)
	if err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, offers)
}

// BroadcastOffer godoc
// POST /api/v1/offers/:id/broadcast
func (h *OfferHandler) BroadcastOffer(c *gin.Context) {
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

	offerID, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "INVALID_OFFER_ID", "invalid offer ID")
		return
	}

	result, err := h.offerService.BroadcastOffer(c.Request.Context(), tOID, offerID)
	if err != nil {
		response.BadRequest(c, "BROADCAST_FAILED", err.Error())
		return
	}

	response.OK(c, result)
}

// GetActiveOffers godoc
// GET /api/v1/offers/public/:slug
func (h *OfferHandler) GetActiveOffers(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		response.BadRequest(c, "MISSING_SLUG", "restaurant slug is required")
		return
	}

	offers, err := h.offerService.GetActiveOffersForMenu(c.Request.Context(), slug)
	if err != nil {
		response.NotFound(c, "Restaurant")
		return
	}

	response.OK(c, offers)
}

// SubscribePush godoc
// POST /api/v1/offers/public/subscribe-push
func (h *OfferHandler) SubscribePush(c *gin.Context) {
	var input struct {
		TenantID      string `json:"tenantId" binding:"required"`
		Endpoint      string `json:"endpoint" binding:"required"`
		P256dhKey     string `json:"p256dhKey" binding:"required"`
		AuthKey       string `json:"authKey" binding:"required"`
		CustomerPhone string `json:"customerPhone"`
		TableSlug     string `json:"tableSlug"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	tOID, err := bson.ObjectIDFromHex(input.TenantID)
	if err != nil {
		response.BadRequest(c, "INVALID_TENANT_ID", "invalid tenant ID")
		return
	}

	sub := &domainoffer.PushSubscription{
		TenantID:      tOID,
		Endpoint:      input.Endpoint,
		P256dhKey:     input.P256dhKey,
		AuthKey:       input.AuthKey,
		CustomerPhone: input.CustomerPhone,
		TableSlug:     input.TableSlug,
	}

	if err := h.offerService.SavePushSubscription(c.Request.Context(), sub); err != nil {
		response.InternalError(c)
		return
	}

	response.OK(c, gin.H{"message": "Push subscription registered"})
}

// TrackClick godoc
// POST /api/v1/offers/public/track-click
func (h *OfferHandler) TrackClick(c *gin.Context) {
	var input struct {
		OfferID string `json:"offerId" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, "INVALID_PAYLOAD", err.Error())
		return
	}

	oOID, err := bson.ObjectIDFromHex(input.OfferID)
	if err != nil {
		response.BadRequest(c, "INVALID_OFFER_ID", "invalid offer ID")
		return
	}

	_ = h.offerService.TrackOfferClick(c.Request.Context(), oOID)
	response.OK(c, gin.H{"tracked": true})
}
