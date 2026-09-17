package routes

import (
	"time"

	redisinfra "github.com/dineflow/api/internal/infrastructure/redis"
	"github.com/dineflow/api/internal/interfaces/http/handlers"
	"github.com/dineflow/api/internal/interfaces/http/middleware"
	"github.com/dineflow/api/pkg/token"
	"github.com/gin-gonic/gin"
)

// Setup registers all routes on the given Gin engine.
func Setup(
	r *gin.Engine,
	tokenMaker *token.Maker,
	redisClient *redisinfra.Client,
	authHandler *handlers.AuthHandler,
	tenantHandler *handlers.TenantHandler,
	staffHandler *handlers.StaffHandler,
	storageHandler *handlers.StorageHandler,
	menuHandler *handlers.MenuHandler,
	tableHandler *handlers.TableHandler,
	orderHandler *handlers.OrderHandler,
	subHandler *handlers.SubscriptionHandler,
	waHandler *handlers.WhatsAppHandler,
	analyticsHandler *handlers.AnalyticsHandler,
	aiHandler *handlers.AIHandler,
	roomHandler *handlers.RoomHandler,
	notifHandler *handlers.NotificationHandler,
	searchHandler *handlers.SearchHandler,
) {
	// Auth middleware (used on protected routes)
	authMiddleware := middleware.Auth(tokenMaker)

	// Rate limiters
	authRateLimit := middleware.RateLimit(redisClient, middleware.ByIPAndRoute, 20, time.Minute)
	apiRateLimit := middleware.RateLimit(redisClient, middleware.ByTenant, 2000, time.Minute)

	// ── Health ──────────────────────────────────────────────────────────────
	r.GET("/health", handlers.Health)

	// ── API v1 ─────────────────────────────────────────────────────────────
	v1 := r.Group("/api/v1")
	{
		v1.GET("/", handlers.Version)
		v1.GET("/health", handlers.Health) // alias for Railway's stored healthcheckPath

		// ── Public Customer QR Endpoints (No login required) ───────────────
		publicGroup := v1.Group("/public")
		{
			publicGroup.GET("/m/:slug", menuHandler.GetPublicMenu)
			publicGroup.POST("/orders", orderHandler.CreateCustomerOrder)
			publicGroup.GET("/orders/:orderId", orderHandler.GetCustomerOrder)
			publicGroup.GET("/rooms/:tenantSlug/:roomNumber", roomHandler.GetPublicRoom)
			publicGroup.GET("/rooms/:tenantSlug/:roomNumber/tasks", roomHandler.GetPublicRoomTasks)
			publicGroup.POST("/rooms/:tenantSlug/:roomNumber/amenity", roomHandler.RequestPublicAmenity)
			publicGroup.GET("/room-tasks/:tenantSlug/:roomNumber", roomHandler.GetPublicRoomTasks)
			publicGroup.POST("/room-tasks/:tenantSlug/:roomNumber", roomHandler.RequestPublicAmenity)
			publicGroup.POST("/rooms/:tenantSlug/:roomNumber/extend-stay", roomHandler.PublicExtendStay)
		}

		// ── Public WhatsApp Webhook (Meta Cloud API) ──────────────────────
		v1.GET("/whatsapp/webhook", waHandler.VerifyWebhook)
		v1.POST("/whatsapp/webhook", waHandler.HandleWebhook)
		v1.GET("/whatsapp/invoices/:id/receipt", waHandler.GetInvoiceReceiptHTML)
		v1.GET("/staff/payslips/:id/view", staffHandler.GetPayslipHTML)

		// ── Auth (Public) ─────────────────────────────────────────────────
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authRateLimit, authHandler.Register)
			auth.POST("/verify-otp", authRateLimit, authHandler.VerifyOTP)
			auth.POST("/send-otp", authRateLimit, authHandler.SendOTP)
			auth.POST("/resend-otp", authRateLimit, authHandler.ResendOTP)
			auth.POST("/login", authRateLimit, authHandler.Login)
			auth.POST("/refresh", authHandler.Refresh)
			auth.POST("/forgot-password", authRateLimit, authHandler.ForgotPassword)
			auth.POST("/reset-password", authRateLimit, authHandler.ResetPassword)
			auth.POST("/accept-invite/:token", authRateLimit, authHandler.AcceptInvite)
		}

		// ── Protected Routes (require JWT) ────────────────────────────────
		protected := v1.Group("", authMiddleware, apiRateLimit)
		{
			// Auth (authenticated)
			protected.POST("/auth/logout", authHandler.Logout)
			protected.GET("/auth/me", authHandler.Me)

			// Tenant management
			tenantGroup := protected.Group("/tenant")
			{
				tenantGroup.GET("", tenantHandler.Get)
				tenantGroup.PATCH("", middleware.OwnerOrManager(), tenantHandler.Update)
				tenantGroup.POST("/logo", middleware.OwnerOnly(), tenantHandler.UploadLogo)
				tenantGroup.GET("/features", tenantHandler.GetFeatures)
				tenantGroup.GET("/onboarding", tenantHandler.GetOnboarding)
				tenantGroup.PATCH("/onboarding/:step", tenantHandler.UpdateOnboardingStep)
			}

			// Staff & Workforce management
			staffGroup := protected.Group("/staff")
			{
				// Core Staff
				staffGroup.GET("", middleware.OwnerOrManager(), staffHandler.List)
				staffGroup.POST("/invite", middleware.OwnerOrManager(), staffHandler.Invite)
				staffGroup.GET("/:userId", middleware.OwnerOrManager(), staffHandler.Get)
				staffGroup.PATCH("/:userId", middleware.OwnerOrManager(), staffHandler.Update)
				staffGroup.PUT("/profiles/:userId", middleware.OwnerOrManager(), staffHandler.UpdateProfile)
				staffGroup.DELETE("/:userId", middleware.OwnerOnly(), staffHandler.Delete)

				// Geofencing
				staffGroup.GET("/geofence", staffHandler.GetGeofence)
				staffGroup.PUT("/geofence", middleware.OwnerOrManager(), staffHandler.UpdateGeofence)

				// Shifts
				staffGroup.GET("/shifts", staffHandler.ListShifts)
				staffGroup.POST("/shifts", middleware.OwnerOrManager(), staffHandler.CreateShift)

				// Attendance
				staffGroup.POST("/attendance/clock-in", staffHandler.ClockIn)
				staffGroup.POST("/attendance/clock-out", staffHandler.ClockOut)
				staffGroup.POST("/attendance/break", staffHandler.ToggleBreak)
				staffGroup.GET("/attendance/today", staffHandler.GetTodayAttendance)
				staffGroup.GET("/attendance/history", staffHandler.GetAttendanceHistory)

				// Leaves
				staffGroup.POST("/leaves", staffHandler.ApplyLeave)
				staffGroup.GET("/leaves", staffHandler.ListLeaves)
				staffGroup.POST("/leaves/:id/approve", middleware.OwnerOrManager(), staffHandler.ApproveLeave)
				staffGroup.POST("/leaves/:id/reject", middleware.OwnerOrManager(), staffHandler.RejectLeave)
				staffGroup.GET("/leaves/balance", staffHandler.GetLeaveBalances)

				// Payroll
				staffGroup.POST("/payroll/run", middleware.OwnerOrManager(), staffHandler.RunPayroll)
				staffGroup.GET("/payroll", middleware.OwnerOrManager(), staffHandler.ListPayslips)
				staffGroup.GET("/payslips/:id", staffHandler.GetPayslip)

				// Holidays
				staffGroup.GET("/holidays", staffHandler.ListHolidays)
				staffGroup.POST("/holidays", middleware.OwnerOrManager(), staffHandler.CreateHoliday)
			}

			// Storage (authenticated file uploads)
			storageGroup := protected.Group("/storage")
			{
				storageGroup.POST("/presign", storageHandler.Presign)
			}

			// ── Menu Management (Phase 2) ──────────────────────────────────
			menuGroup := protected.Group("/menu")
			{
				menuGroup.GET("/categories", menuHandler.ListCategories)
				menuGroup.POST("/categories", middleware.OwnerOrManager(), menuHandler.CreateCategory)
				menuGroup.PUT("/categories/:id", middleware.OwnerOrManager(), menuHandler.UpdateCategory)
				menuGroup.DELETE("/categories/:id", middleware.OwnerOrManager(), menuHandler.DeleteCategory)

				menuGroup.GET("/items", menuHandler.ListItems)
				menuGroup.POST("/items", middleware.OwnerOrManager(), menuHandler.CreateItem)
				menuGroup.PUT("/items/:id", middleware.OwnerOrManager(), menuHandler.UpdateItem)
				menuGroup.POST("/items/bulk", middleware.OwnerOrManager(), menuHandler.BulkCreateItems)
				menuGroup.PATCH("/items/bulk", middleware.OwnerOrManager(), menuHandler.BulkUpdateItems)
				menuGroup.POST("/items/bulk-delete", middleware.OwnerOrManager(), menuHandler.BulkDeleteItems)
				menuGroup.PATCH("/items/:id/availability", menuHandler.ToggleAvailability)
				menuGroup.DELETE("/items/:id", middleware.OwnerOrManager(), menuHandler.DeleteItem)
				menuGroup.POST("/scan", middleware.OwnerOrManager(), menuHandler.ScanMenu)
			}

			// ── Table Management (Phase 2) ─────────────────────────────────
			tableGroup := protected.Group("/tables")
			{
				tableGroup.GET("", tableHandler.List)
				tableGroup.POST("", middleware.OwnerOrManager(), tableHandler.Create)
				tableGroup.PATCH("/:id/status", tableHandler.UpdateStatus)
				tableGroup.DELETE("/:id", middleware.OwnerOnly(), tableHandler.Delete)
			}

			// ── Hotel Rooms & PMS ───────────────────────────────────────────
			roomGroup := protected.Group("/rooms")
			{
				roomGroup.GET("", roomHandler.List)
				roomGroup.GET("/stats", roomHandler.GetStats)
				roomGroup.GET("/tasks", roomHandler.ListTasks)
				roomGroup.PATCH("/tasks/:taskId", roomHandler.UpdateTask)
				roomGroup.POST("", middleware.OwnerOrManager(), roomHandler.Create)
				roomGroup.POST("/bulk", middleware.OwnerOrManager(), roomHandler.BulkCreate)
				roomGroup.POST("/upload-id", roomHandler.UploadIDProof)
				roomGroup.GET("/:id", roomHandler.Get)
				roomGroup.GET("/:id/stay-summary", roomHandler.GetStaySummary)
				roomGroup.PUT("/:id", middleware.OwnerOrManager(), roomHandler.Update)
				roomGroup.DELETE("/:id", middleware.OwnerOnly(), roomHandler.Delete)
				roomGroup.PATCH("/:id/dnd", roomHandler.ToggleDND)
				roomGroup.PATCH("/:id/status", roomHandler.UpdateStatus)
				roomGroup.POST("/:id/check-in", middleware.OwnerOrManager(), roomHandler.CheckIn)
				roomGroup.POST("/:id/check-out", middleware.OwnerOrManager(), roomHandler.CheckOut)
				roomGroup.POST("/:id/extend-stay", middleware.OwnerOrManager(), roomHandler.StaffExtendStay)
				roomGroup.PUT("/:id/guest", middleware.OwnerOrManager(), roomHandler.UpdateStay)
				roomGroup.PUT("/:id/stay", middleware.OwnerOrManager(), roomHandler.UpdateStay)
				roomGroup.GET("/:id/orders", roomHandler.GetOrders)
				roomGroup.GET("/:id/tasks", roomHandler.ListTasks)
				roomGroup.POST("/:id/tasks", roomHandler.CreateTask)
				roomGroup.PATCH("/:id/tasks/:taskId", roomHandler.UpdateTask)
				roomGroup.DELETE("/:id/history", middleware.OwnerOrManager(), roomHandler.ClearHistory)
			}

			// ── Live Orders & KDS (Phase 2 & 3) ───────────────────────────
			orderGroup := protected.Group("/orders")
			{
				orderGroup.GET("", orderHandler.List)
				orderGroup.PATCH("/:orderId/status", orderHandler.UpdateStatus)
				orderGroup.GET("/stream", orderHandler.StreamOrders)
			}

			// ── Subscription & Billing (Phase 4) ───────────────────────────
			billingGroup := protected.Group("/billing")
			{
				billingGroup.GET("/status", subHandler.GetBillingStatus)
				billingGroup.POST("/checkout", middleware.OwnerOnly(), subHandler.CreateCheckout)
				billingGroup.POST("/change-plan", middleware.OwnerOnly(), subHandler.ChangePlan)
				billingGroup.GET("/invoices", subHandler.ListInvoices)
				billingGroup.POST("/simulate-grace-period", middleware.OwnerOnly(), subHandler.SimulateGracePeriod)
			}

			// ── Platform Super-Admin (Phase 4) ─────────────────────────────
			adminGroup := protected.Group("/admin")
			{
				adminGroup.GET("/platform/overview", subHandler.GetPlatformOverview)
				adminGroup.POST("/platform/override-plan", subHandler.AdminOverridePlan)
			}

			// ── WhatsApp Marketing & Invoicing (Meta Cloud API, AI Chatbot & GST Invoicing) ───
			waGroup := protected.Group("/whatsapp")
			{
				waGroup.GET("/status", waHandler.GetStatus)
				waGroup.GET("/config", waHandler.GetConfig)
				waGroup.PUT("/config", waHandler.UpdateConfig)
				waGroup.POST("/send-test", waHandler.SendTestMessage)
				waGroup.GET("/logs", waHandler.ListLogs)
				waGroup.GET("/segments", waHandler.GetSegments)
				waGroup.GET("/campaigns", waHandler.ListCampaigns)
				waGroup.POST("/campaigns", waHandler.CreateCampaign)
				waGroup.POST("/campaigns/:id/send", waHandler.SendCampaign)
				waGroup.GET("/templates", waHandler.ListTemplates)
				waGroup.POST("/chatbot/simulate", waHandler.SimulateChatbot)
				waGroup.GET("/invoices", waHandler.ListInvoices)
				waGroup.POST("/invoices", waHandler.CreateInvoice)
				waGroup.POST("/invoices/:id/send", waHandler.SendInvoiceWhatsApp)
			}

			// ── Sales & Operational Analytics (Phase 5) ────────────────────
			analyticsGroup := protected.Group("/analytics")
			{
				analyticsGroup.GET("/overview", analyticsHandler.GetOverview)
				analyticsGroup.GET("/hourly", analyticsHandler.GetHourlyVelocity)
				analyticsGroup.GET("/items", analyticsHandler.GetTopItems)
				analyticsGroup.GET("/categories", analyticsHandler.GetCategoryBreakdown)
				analyticsGroup.GET("/export", analyticsHandler.ExportCSV)
			}

			// ── AI Features (Phase 6) ──────────────────────────────────────────────
			aiGroup := protected.Group("/ai")
			{
				aiGroup.GET("/status", aiHandler.GetStatus)
				aiGroup.POST("/menu-description", middleware.OwnerOrManager(), aiHandler.GenerateMenuDescription)
				aiGroup.POST("/upsell", aiHandler.GetUpsellSuggestions)
				aiGroup.GET("/forecast", middleware.OwnerOrManager(), aiHandler.GetDemandForecast)
				aiGroup.GET("/pricing-alerts", middleware.OwnerOrManager(), aiHandler.GetPricingAlerts)
				aiGroup.POST("/chatbot", aiHandler.ChatbotReply)
			}

			// ── Notifications ──────────────────────────────────────────────
			notifGroup := protected.Group("/notifications")
			{
				notifGroup.GET("", notifHandler.List)
				notifGroup.GET("/unread-count", notifHandler.GetUnreadCount)
				notifGroup.PATCH("/:id/read", notifHandler.MarkAsRead)
				notifGroup.POST("/mark-all-read", notifHandler.MarkAllAsRead)
				notifGroup.DELETE("/clear-read", notifHandler.ClearRead)
				notifGroup.POST("", notifHandler.Create)
				notifGroup.GET("/stream", notifHandler.Stream)
			}

			// ── Global Search (Database-driven, multi-tenant) ───────────────
			searchGroup := protected.Group("/search")
			{
				searchGroup.GET("", searchHandler.Search)
			}
		}
	}
}
