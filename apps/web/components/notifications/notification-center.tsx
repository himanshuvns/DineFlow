'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  BellOff,
  ShoppingCart,
  Bed,
  Building2,
  Wrench,
  CreditCard,
  UtensilsCrossed,
  Users,
  Settings,
  Loader2,
} from 'lucide-react'
import { useNotificationStore, type Notification, type NotificationCategory } from '@/lib/stores/notification-store'
import { useAuthStore } from '@/lib/stores/auth-store'

// ── Inline time helper ────────────────────────────────────────────────────────
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

// ── Notification text sanitizer ───────────────────────────────────────────────
export function sanitizeNotification(title: string, message: string) {
  let cleanTitle = (title || '').trim()
  let cleanMessage = (message || '').trim()

  // 1. Fix repeated "#" like "##ORD-8670" -> "#ORD-8670"
  cleanTitle = cleanTitle.replace(/#+/g, '#')

  // 2. Fix "Table Table 1" duplication -> "Table 1"
  cleanMessage = cleanMessage.replace(/\bTable\s+Table\s+/gi, 'Table ')
  cleanTitle = cleanTitle.replace(/\bTable\s+Table\s+/gi, 'Table ')

  // 3. Fix raw hex / ObjectID guest names (e.g. "fBFADB extended stay..." -> "Guest extended stay...")
  cleanMessage = cleanMessage.replace(/^[a-fA-F0-9]{6,24}\s+extended stay/i, 'Guest extended stay')
  cleanTitle = cleanTitle.replace(/^[a-fA-F0-9]{6,24}\s+/i, 'Guest ')

  return { title: cleanTitle, message: cleanMessage }
}

// ── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_META: Record<
  NotificationCategory,
  { label: string; icon: React.ReactNode; iconBg: string; textColor: string }
> = {
  orders: {
    label: 'Orders',
    icon: <ShoppingCart className="w-4 h-4" />,
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
  },
  room_service: {
    label: 'Room Service',
    icon: <Bed className="w-4 h-4" />,
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    textColor: 'text-purple-600 dark:text-purple-400',
  },
  reservations: {
    label: 'Reservations',
    icon: <Building2 className="w-4 h-4" />,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  housekeeping: {
    label: 'Housekeeping',
    icon: <Wrench className="w-4 h-4" />,
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  payments: {
    label: 'Payments',
    icon: <CreditCard className="w-4 h-4" />,
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
  menu: {
    label: 'Menu',
    icon: <UtensilsCrossed className="w-4 h-4" />,
    iconBg: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400',
    textColor: 'text-orange-600 dark:text-orange-400',
  },
  staff: {
    label: 'Staff',
    icon: <Users className="w-4 h-4" />,
    iconBg: 'bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400',
    textColor: 'text-sky-600 dark:text-sky-400',
  },
  system: {
    label: 'System',
    icon: <Settings className="w-4 h-4" />,
    iconBg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400',
    textColor: 'text-slate-600 dark:text-slate-400',
  },
}

const CATEGORIES: Array<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'orders', label: 'Orders' },
  { key: 'room_service', label: 'Room Service' },
  { key: 'reservations', label: 'Reservations' },
  { key: 'housekeeping', label: 'Housekeeping' },
  { key: 'payments', label: 'Payments' },
  { key: 'system', label: 'System' },
]

// ── Notification Card ────────────────────────────────────────────────────────
function NotifCard({ notif, onRead }: { notif: Notification; onRead: (id: string) => void }) {
  const router = useRouter()
  const meta = CATEGORY_META[notif.category] || CATEGORY_META.system
  const { title: cleanTitle, message: cleanMessage } = sanitizeNotification(notif.title, notif.message)

  const handleClick = () => {
    if (!notif.read) onRead(notif.id)
    if (notif.actionUrl) router.push(notif.actionUrl)
  }

  const isHighPriority = notif.priority === 'high' || notif.priority === 'critical'

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-3.5 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-all relative flex items-start gap-3 group cursor-pointer ${
        !notif.read ? 'bg-emerald-50/30 dark:bg-emerald-950/15' : ''
      }`}
    >
      {/* Category icon avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-transform group-hover:scale-105 ${meta.iconBg}`}
      >
        {meta.icon}
      </div>

      {/* Main content body */}
      <div className="flex-1 min-w-0">
        {/* Top metadata line: category + time + priority */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${meta.textColor}`}>
              {meta.label}
            </span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
              {timeAgo(notif.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isHighPriority && (
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-2xs ${
                  notif.priority === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {notif.priority}
              </span>
            )}
            {!notif.read && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Unread" />
            )}
          </div>
        </div>

        {/* Title row - given full width to prevent premature ellipsis */}
        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {cleanTitle}
        </p>

        {/* Message body */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
          {cleanMessage}
        </p>
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

  const tenantId = useAuthStore((s) => s.tenant?.id)
  const accessToken = useAuthStore((s) => s.accessToken)
  const prevCountRef = useRef(unreadCount)

  // Real-time SSE connection whenever auth store is hydrated and active
  useEffect(() => {
    if (!tenantId || !accessToken) return

    void fetchUnreadCount()
    connectSSE()

    // Poll unread count every 15s as fallback for dropped socket connections
    const interval = setInterval(() => void fetchUnreadCount(), 15_000)
    return () => {
      clearInterval(interval)
      disconnectSSE()
    }
  }, [tenantId, accessToken, fetchUnreadCount, connectSSE, disconnectSSE])

  // Fetch notifications when panel opens / category changes
  useEffect(() => {
    if (open) {
      void fetchNotifications({ category: activeCategory === 'all' ? undefined : activeCategory })
    }
  }, [open, activeCategory, fetchNotifications])

  // Click outside or Escape to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const filteredNotifs = notifications

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold px-1 leading-none shadow-xs animate-in zoom-in-75">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Panel */}
      {open && (
        <div
          className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-18 sm:top-full sm:mt-2 sm:w-[420px] max-w-[calc(100vw-1.5rem)] sm:max-w-none rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ maxHeight: '560px' }}
        >
          {/* Header (shrink-0 ensures it is never compressed by flexbox) */}
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => void markAllAsRead()}
                  title="Mark all read"
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => void clearRead()}
                title="Clear read notifications"
                className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setOpen(false)
                  router.push('/dashboard/notifications')
                }}
                title="View full Notification Center"
                className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors font-semibold cursor-pointer"
              >
                View all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category filter tabs (shrink-0 + overflow-y-hidden prevents vertical cropping) */}
          <div className="shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 overflow-x-auto overflow-y-hidden scrollbar-none bg-white dark:bg-slate-900">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.key
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Notification list */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100/60 dark:divide-slate-800/60">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs text-slate-400">Loading notifications...</span>
              </div>
            ) : filteredNotifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-4 text-center gap-2 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 mb-1">
                  <BellOff className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">All caught up!</p>
                <p className="text-xs text-slate-500 max-w-[240px]">No notifications in this category.</p>
              </div>
            ) : (
              filteredNotifs.map((n) => <NotifCard key={n.id} notif={n} onRead={markAsRead} />)
            )}
          </div>

          {/* Footer bar */}
          {filteredNotifs.length > 0 && (
            <div className="shrink-0 px-4 py-2.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {filteredNotifs.length} notification{filteredNotifs.length === 1 ? '' : 's'}
              </span>
              <button
                onClick={() => {
                  setOpen(false)
                  router.push('/dashboard/notifications')
                }}
                className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Open Notification Center →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
