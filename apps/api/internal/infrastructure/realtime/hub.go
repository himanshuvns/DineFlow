package realtime

import (
	"encoding/json"
	"sync"

	"github.com/dineflow/api/internal/domain/order"
)

type EventType string

const (
	EventOrderCreated EventType = "order.created"
	EventOrderUpdated EventType = "order.updated"
	EventOrderBumped  EventType = "order.bumped"
)

// OrderEvent represents a live event dispatched to connected SSE clients.
type OrderEvent struct {
	TenantID  string       `json:"tenantId"`
	EventType EventType    `json:"type"`
	Order     *order.Order `json:"order"`
}

// Hub manages active Server-Sent Event (SSE) client connections per tenant.
type Hub struct {
	mu      sync.RWMutex
	clients map[string]map[chan []byte]bool // tenantID -> set of channels
}

var (
	defaultHub *Hub
	once       sync.Once
)

// GetHub returns the singleton Hub.
func GetHub() *Hub {
	once.Do(func() {
		defaultHub = &Hub{
			clients: make(map[string]map[chan []byte]bool),
		}
	})
	return defaultHub
}

// Register adds a client channel for a specific tenant.
func (h *Hub) Register(tenantID string, ch chan []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, ok := h.clients[tenantID]; !ok {
		h.clients[tenantID] = make(map[chan []byte]bool)
	}
	h.clients[tenantID][ch] = true
}

// Unregister removes a client channel.
func (h *Hub) Unregister(tenantID string, ch chan []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if channels, ok := h.clients[tenantID]; ok {
		delete(channels, ch)
		close(ch)
		if len(channels) == 0 {
			delete(h.clients, tenantID)
		}
	}
}

// Broadcast sends an event payload to all clients belonging to that tenant.
func (h *Hub) Broadcast(event *OrderEvent) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	channels, ok := h.clients[event.TenantID]
	if !ok || len(channels) == 0 {
		return
	}

	payload, err := json.Marshal(event)
	if err != nil {
		return
	}

	for ch := range channels {
		select {
		case ch <- payload:
		default:
			// Non-blocking write: skip slow client
		}
	}
}
