import { create } from 'zustand'
import { apiClient, getBaseURL } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/auth-store'

export type NotificationCategory =
  | 'orders'
  | 'room_service'
  | 'reservations'
  | 'housekeeping'
  | 'payments'
  | 'menu'
  | 'staff'
  | 'system'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Notification {
  id: string
  tenantId: string
  userId?: string
  category: NotificationCategory
  title: string
  message: string
  priority: NotificationPriority
  read: boolean
  actionUrl?: string
  metadata?: Record<string, unknown>
  createdAt: string
  expiresAt?: string
}

interface ListNotificationsResponse {
  success: boolean
  data: Notification[]
  unreadCount: number
  total: number
  page: number
  limit: number
}

interface UnreadCountResponse {
  success: boolean
  unreadCount: number
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  total: number
  isLoading: boolean
  sseRef: EventSource | null

  fetchNotifications: (params?: {
    page?: number
    limit?: number
    category?: string
    priority?: string
    read?: boolean
    search?: string
  }) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  clearRead: () => Promise<void>
  pushNotification: (notif: Notification) => void
  connectSSE: () => void
  disconnectSSE: () => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
  sseRef: null,

  fetchNotifications: async (params = {}) => {
    set({ isLoading: true })
    try {
      const { data } = await apiClient.get<ListNotificationsResponse>('/notifications', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 30,
          ...(params.category && params.category !== 'all' ? { category: params.category } : {}),
          ...(params.priority && params.priority !== 'all' ? { priority: params.priority } : {}),
          ...(typeof params.read === 'boolean' ? { read: params.read } : {}),
          ...(params.search ? { search: params.search } : {}),
        },
      })
      set({
        notifications: data.data,
        unreadCount: data.unreadCount,
        total: data.total,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await apiClient.get<UnreadCountResponse>('/notifications/unread-count')
      set({ unreadCount: data.unreadCount })
    } catch {
      // silent
    }
  },

  markAsRead: async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.post('/notifications/mark-all-read')
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch {
      // silent
    }
  },

  clearRead: async () => {
    try {
      await apiClient.delete('/notifications/clear-read')
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.read),
      }))
    } catch {
      // silent
    }
  },

  pushNotification: (notif: Notification) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notif.id)
      if (exists) return state
      return {
        notifications: [notif, ...state.notifications],
        unreadCount: notif.read ? state.unreadCount : state.unreadCount + 1,
        total: state.total + 1,
      }
    })
  },

  connectSSE: () => {
    const existing = get().sseRef
    if (existing && existing.readyState !== EventSource.CLOSED) return

    const authState = useAuthStore.getState()
    const tenantId = authState.tenant?.id
    const token = authState.accessToken
    if (!tenantId || !token) return

    const rawBase = getBaseURL()
    const cleanBase = rawBase.replace(/\/api\/v1\/?$/, '')
    const url = `${cleanBase}/api/v1/notifications/stream?tenantId=${encodeURIComponent(tenantId)}&token=${encodeURIComponent(token)}`

    try {
      const es = new EventSource(url)

      const handlePayload = (dataStr: string) => {
        try {
          const raw = JSON.parse(dataStr)
          // Look for notification in:
          // 1. raw.notification (from Go NotificationEvent)
          // 2. raw.data
          // 3. raw directly
          let notif: Notification | null = null
          if (raw?.notification && typeof raw.notification === 'object' && raw.notification.id) {
            notif = raw.notification as Notification
          } else if (raw?.data && typeof raw.data === 'object' && raw.data.id) {
            notif = raw.data as Notification
          } else if (raw?.id) {
            notif = raw as Notification
          }

          if (notif?.id) {
            get().pushNotification(notif)
          }
        } catch {
          // Ignore ping or keepalive events
        }
      }

      es.addEventListener('notification', (e) => handlePayload(e.data))
      es.addEventListener('message', (e) => handlePayload(e.data))
      es.onmessage = (e) => handlePayload(e.data)

      set({ sseRef: es })
    } catch (err) {
      console.warn('[NotificationStore] EventSource connection failed:', err)
    }
  },

  disconnectSSE: () => {
    get().sseRef?.close()
    set({ sseRef: null })
  },
}))
