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
  markMultipleAsRead: (ids: string[]) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  deleteNotifications: (ids: string[]) => Promise<void>
  clearRead: () => Promise<void>
  pushNotification: (notif: Notification) => void
  connectSSE: () => void
  disconnectSSE: () => void
}

// Helper to manage locally deleted notification IDs so that refetches or local dev don't restore deleted items
const getDeletedIds = (tenantId?: string): Set<string> => {
  if (typeof window === 'undefined' || !tenantId) return new Set()
  try {
    const raw = localStorage.getItem(`dineflow_deleted_notifs_${tenantId}`)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

const addDeletedIds = (tenantId: string | undefined, ids: string[]) => {
  if (typeof window === 'undefined' || !tenantId || ids.length === 0) return
  try {
    const current = getDeletedIds(tenantId)
    ids.forEach((id) => current.add(id))
    const arr = Array.from(current)
    const trimmed = arr.length > 500 ? arr.slice(arr.length - 500) : arr
    localStorage.setItem(`dineflow_deleted_notifs_${tenantId}`, JSON.stringify(trimmed))
  } catch {
    // silent
  }
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
      const tenantId = useAuthStore.getState().tenant?.id
      const deletedIds = getDeletedIds(tenantId)
      const filtered = data.data.filter((n) => !deletedIds.has(n.id))
      const deletedUnreadCount = data.data.filter((n) => deletedIds.has(n.id) && !n.read).length

      set({
        notifications: filtered,
        unreadCount: Math.max(0, data.unreadCount - deletedUnreadCount),
        total: Math.max(0, data.total - (data.data.length - filtered.length)),
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

  markMultipleAsRead: async (ids: string[]) => {
    if (!ids.length) return
    const idSet = new Set(ids)
    set((state) => {
      const newlyReadCount = state.notifications.filter((n) => idSet.has(n.id) && !n.read).length
      return {
        notifications: state.notifications.map((n) =>
          idSet.has(n.id) ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - newlyReadCount),
      }
    })
    try {
      await Promise.allSettled(ids.map((id) => apiClient.patch(`/notifications/${id}/read`)))
    } catch {
      // silent
    }
  },

  deleteNotifications: async (ids: string[]) => {
    if (!ids.length) return
    const tenantId = useAuthStore.getState().tenant?.id
    addDeletedIds(tenantId, ids)
    const idSet = new Set(ids)

    set((state) => {
      const deletedUnread = state.notifications.filter((n) => idSet.has(n.id) && !n.read).length
      return {
        notifications: state.notifications.filter((n) => !idSet.has(n.id)),
        unreadCount: Math.max(0, state.unreadCount - deletedUnread),
        total: Math.max(0, state.total - ids.length),
      }
    })

    try {
      await apiClient.post('/notifications/delete-batch', { ids })
    } catch {
      try {
        await Promise.allSettled(ids.map((id) => apiClient.delete(`/notifications/${id}`)))
      } catch {
        // silent
      }
    }
  },

  deleteNotification: async (id: string) => {
    await get().deleteNotifications([id])
  },

  clearRead: async () => {
    const tenantId = useAuthStore.getState().tenant?.id
    const readIds = get().notifications.filter((n) => n.read).map((n) => n.id)
    addDeletedIds(tenantId, readIds)

    try {
      await apiClient.delete('/notifications/clear-read')
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.read),
      }))
    } catch {
      set((state) => ({
        notifications: state.notifications.filter((n) => !n.read),
      }))
    }
  },

  pushNotification: (notif: Notification) => {
    const tenantId = useAuthStore.getState().tenant?.id
    const deletedIds = getDeletedIds(tenantId)
    if (deletedIds.has(notif.id)) return

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
