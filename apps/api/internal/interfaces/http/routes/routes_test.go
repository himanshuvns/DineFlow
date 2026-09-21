package routes_test

import (
	"testing"

	"github.com/dineflow/api/internal/interfaces/http/handlers"
	"github.com/dineflow/api/internal/interfaces/http/routes"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRoutesSetup_NoPanic(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()

	assert.NotPanics(t, func() {
		routes.Setup(
			r,
			nil, // tokenMaker
			nil, // redisClient
			&handlers.AuthHandler{},
			&handlers.TenantHandler{},
			&handlers.StaffHandler{},
			&handlers.StorageHandler{},
			&handlers.MenuHandler{},
			&handlers.TableHandler{},
			&handlers.OrderHandler{},
			&handlers.SubscriptionHandler{},
			&handlers.WhatsAppHandler{},
			&handlers.AnalyticsHandler{},
			&handlers.AIHandler{},
			&handlers.RoomHandler{},
			&handlers.NotificationHandler{},
			&handlers.SearchHandler{},
			&handlers.PlatformHandler{},
		)
	})
}
