'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, BellOff, CheckCheck, Trash2, Search, Filter, Loader2,
  ShoppingCart, Bed, Building2, Wrench, CreditCard, UtensilsCrossed, Users, Settings,
  ArrowLeft,
} from 'lucide-react'
import { useNotificationStore, type NotificationCategory, type NotificationPriority } from '@/lib/stores/notification-store'
import { sanitizeNotification } from '@/components/notifications/notification-center'
import { EmptyState } from '@/components/ui/empty-state'
import { useToast } from '@/components/ui/toast'

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


// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_META: Record<NotificationCategory, { label: string; icon: React.ReactNode; colorClass: string }> = {
  orders: {
    label: 'Orders',
    icon: <ShoppingCart className="w-4 h-4" />,
    colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  room_service: {
    label: 'Room Service',
    icon: <Bed className="w-4 h-4" />,
    colorClass: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  },
  reservations: {
    label: 'Reservations',
    icon: <Building2 className="w-4 h-4" />,
    colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  housekeeping: {
    label: 'Housekeeping',
    icon: <Wrench className="w-4 h-4" />,
    colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  payments: {
    label: 'Payments',
    icon: <CreditCard className="w-4 h-4" />,
    colorClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  menu: {
    label: 'Menu',
    icon: <UtensilsCrossed className="w-4 h-4" />,
    colorClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  staff: {
    label: 'Staff',
    icon: <Users className="w-4 h-4" />,
    colorClass: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  },
  system: {
    label: 'System',
    icon: <Settings className="w-4 h-4" />,
    colorClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
}

const PRIORITY_BADGE: Record<NotificationPriority, string> = {
  critical: 'bg-red-600 text-white',
  high: 'bg-amber-500 text-white',
  medium: 'bg-blue-500 text-white',
  low: 'bg-gray-400 text-white',
}

const CATEGORIES = ['all', 'orders', 'room_service', 'reservations', 'housekeeping', 'payments', 'menu', 'staff', 'system'] as const
const PRIORITIES = ['all', 'critical', 'high', 'medium', 'low'] as const

export default function NotificationsPage() {
  const router = useRouter()
  const {
    notifications, unreadCount, total, isLoading,
    fetchNotifications, markAsRead, markAllAsRead, markMultipleAsRead, clearRead,
    deleteNotification, deleteNotifications,
  } = useNotificationStore()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const [priority, setPriority] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(() => {
    void fetchNotifications({
      page,
      limit: 20,
      category: category !== 'all' ? category : undefined,
      priority: priority !== 'all' ? priority : undefined,
      read: readFilter === 'all' ? undefined : readFilter === 'read',
      search: search || undefined,
    })
  }, [fetchNotifications, page, category, priority, readFilter, search])

  useEffect(() => { load() }, [load])

  const totalPages = Math.ceil(total / 20)

  const allVisibleSelected = notifications.length > 0 && notifications.every((n) => selectedIds.includes(n.id))
  const someVisibleSelected = notifications.some((n) => selectedIds.includes(n.id)) && !allVisibleSelected

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const visibleIds = notifications.map((n) => n.id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...visibleIds])))
    } else {
      const visibleIdSet = new Set(notifications.map((n) => n.id))
      setSelectedIds((prev) => prev.filter((id) => !visibleIdSet.has(id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    setIsDeleting(true)
    const count = selectedIds.length
    try {
      await deleteNotifications(selectedIds)
      setSelectedIds([])
      addToast('success', 'Notifications Deleted', `Successfully deleted ${count} notification${count > 1 ? 's' : ''}.`)
    } catch {
      addToast('error', 'Error', 'Failed to delete selected notifications.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteNotification(id)
      setSelectedIds((prev) => prev.filter((item) => item !== id))
      addToast('info', 'Notification Deleted', 'Notification removed.')
    } catch {
      addToast('error', 'Error', 'Failed to delete notification.')
    }
  }

  const handleMarkSelectedAsRead = async () => {
    if (selectedIds.length === 0) return
    const unreadSelected = notifications.filter((n) => selectedIds.includes(n.id) && !n.read).map((n) => n.id)
    if (unreadSelected.length === 0) {
      addToast('info', 'Already Read', 'All selected notifications are already marked as read.')
      return
    }
    await markMultipleAsRead(unreadSelected)
    addToast('success', 'Marked as Read', `Marked ${unreadSelected.length} notification${unreadSelected.length > 1 ? 's' : ''} as read.`)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-800 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-500" />
              Notification Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {total} total event{total === 1 ? "" : "s"} · {unreadCount} unread
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllAsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          <button
            onClick={() => void clearRead()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Clear read
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Category filter */}
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All categories' : CATEGORY_META[c as NotificationCategory]?.label ?? c}
                </option>
              ))}
            </select>

            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1) }}
              className="text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All priorities' : p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>

            {/* Read/Unread toggle */}
            {(['all', 'unread', 'read'] as const).map((v) => (
              <button
                key={v}
                onClick={() => { setReadFilter(v); setPage(1) }}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  readFilter === v
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Action Bar / Selection Bar */}
          {!isLoading && notifications.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someVisibleSelected
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer"
                />
                <span>
                  {selectedIds.length > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {selectedIds.length} of {notifications.length} selected
                    </span>
                  ) : (
                    <span>Select all ({notifications.length})</span>
                  )}
                </span>
              </label>

              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <button
                    onClick={handleMarkSelectedAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Mark read
                  </button>
                  <button
                    disabled={isDeleting}
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete ({selectedIds.length})
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16">
              <EmptyState
                icon={<BellOff className="w-8 h-8 text-slate-400 dark:text-slate-500" />}
                title="No notifications found"
                description={
                  category !== 'all' || priority !== 'all' || readFilter !== 'all' || search
                    ? "No alerts match your current filter criteria. Try resetting filters."
                    : "You're all caught up! Live kitchen, guest orders, and system alerts will appear here."
                }
                action={
                  category !== 'all' || priority !== 'all' || readFilter !== 'all' || search
                    ? {
                        label: "Clear Filters",
                        onClick: () => {
                          setCategory('all')
                          setPriority('all')
                          setReadFilter('all')
                          setSearch('')
                        },
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            notifications.map((notif) => {
              const meta = CATEGORY_META[notif.category]
              const { title: cleanTitle, message: cleanMessage } = sanitizeNotification(notif.title, notif.message)
              const isSelected = selectedIds.includes(notif.id)

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) void markAsRead(notif.id)
                    if (notif.actionUrl) router.push(notif.actionUrl)
                  }}
                  className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-inset ring-emerald-500/20'
                      : !notif.read
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                      : ''
                  }`}
                >
                  {/* Row Checkbox */}
                  <div className="mt-1 shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(notif.id)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer"
                      aria-label={`Select notification: ${cleanTitle}`}
                    />
                  </div>

                  {/* Unread dot */}
                  <div className="mt-2 shrink-0">
                    {!notif.read ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Category icon */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 mt-0.5 ${meta?.colorClass}`}>
                    {meta?.icon}
                    <span className="hidden xs:inline">{meta?.label}</span>
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{cleanTitle}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${PRIORITY_BADGE[notif.priority]}`}>
                          {notif.priority}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{cleanMessage}</p>
                  </div>

                  {/* Row actions */}
                  <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!notif.read && (
                      <button
                        onClick={() => void markAsRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => void handleDeleteSingle(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-medium text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
