'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, X, CheckCheck, Trash2, BellOff, ShoppingCart, Bed, Building2, Wrench, CreditCard, UtensilsCrossed, Users, Settings, Loader2 } from 'lucide-react'
import { useNotificationStore, type Notification, type NotificationCategory } from '@/lib/stores/notification-store'

// ── Inline time helper (no date-fns dependency) ───────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return new Date(dateStr).toLocaleDateString()
}


// ── Category metadata ──────────────────────────────────────────────────────
const CATEGORY_META: Record<NotificationCategory, { label: string; icon: React.ReactNode; colorClass: string }> = {
  orders: {
    label: 'Orders',
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  room_service: {
    label: 'Room Service',
    icon: <Bed className="w-3.5 h-3.5" />,
    colorClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  reservations: {
    label: 'Reservations',
    icon: <Building2 className="w-3.5 h-3.5" />,
    colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  housekeeping: {
    label: 'Housekeeping',
    icon: <Wrench className="w-3.5 h-3.5" />,
    colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  payments: {
    label: 'Payments',
    icon: <CreditCard className="w-3.5 h-3.5" />,
    colorClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  menu: {
    label: 'Menu',
    icon: <UtensilsCrossed className="w-3.5 h-3.5" />,
    colorClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  staff: {
    label: 'Staff',
    icon: <Users className="w-3.5 h-3.5" />,
    colorClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  system: {
    label: 'System',
    icon: <Settings className="w-3.5 h-3.5" />,
    colorClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
}

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-amber-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-gray-400 text-white',
}

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'room_service', label: 'Room Svc' },
  { key: 'reservations', label: 'Reserv.' },
  { key: 'housekeeping', label: 'HK' },
  { key: 'payments', label: 'Payments' },
  { key: 'system', label: 'System' },
]

// ── Notification Card ─────────────────────────────────────────────────────
function NotifCard({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const router = useRouter()
  const meta = CATEGORY_META[notif.category]

  const handleClick = () => {
    if (!notif.read) onRead(notif.id)
    if (notif.actionUrl) router.push(notif.actionUrl)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors relative ${!notif.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
    >
      {!notif.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
      )}
      <div className="flex items-start gap-2 pl-2">
        {/* Category badge */}
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 shrink-0 ${meta?.colorClass ?? 'bg-gray-100 text-gray-500'}`}>
          {meta?.icon}
          <span className="hidden sm:inline">{meta?.label}</span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">{notif.title}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${PRIORITY_BADGE[notif.priority] ?? 'bg-gray-200'}`}>
              {notif.priority}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">{notif.message}</p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-600 mt-1">
            {timeAgo(notif.createdAt)}
          </p>
        </div>
      </div>
    </button>
  )
}

// ── Main NotificationCenter ───────────────────────────────────────────────
export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearRead,
    connectSSE,
    disconnectSSE,
  } = useNotificationStore()

  // Initial load + SSE connection
  useEffect(() => {
    void fetchUnreadCount()
    connectSSE()
    // Poll unread count every 30s as fallback
    const interval = setInterval(() => void fetchUnreadCount(), 30_000)
    return () => {
      clearInterval(interval)
      disconnectSSE()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch notifications when panel opens / category changes
  useEffect(() => {
    if (open) {
      void fetchNotifications({ category: activeCategory === 'all' ? undefined : activeCategory })
    }
  }, [open, activeCategory, fetchNotifications])

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filteredNotifs = notifications

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-1rem)] rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 z-[200] flex flex-col overflow-hidden"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllAsRead()}
                  title="Mark all read"
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => void clearRead()}
                title="Clear read notifications"
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setOpen(false); router.push('/dashboard/notifications') }}
                title="View all"
                className="text-xs px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors font-medium"
              >
                View all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 transition-colors ${
                  activeCategory === cat.key
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-neutral-400">
                <BellOff className="w-8 h-8" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs">No notifications yet.</p>
              </div>
            ) : (
              filteredNotifs.map((n) => (
                <NotifCard key={n.id} notif={n} onRead={markAsRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
