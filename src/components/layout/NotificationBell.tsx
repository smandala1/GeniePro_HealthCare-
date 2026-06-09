"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, BellDot, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Notification = {
  id: string
  type: string
  title: string
  body: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

function timeAgo(dateStr: string) {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (secs < 60)  return "just now"
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

export function NotificationBell({ collapsed }: { collapsed: boolean }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications")
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnread(data.unreadCount ?? 0)
    } catch { /* silently ignore */ }
  }

  // Poll every 30 seconds
  useEffect(() => {
    fetchNotifications()
    const id = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(id)
  }, [])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnread(0)
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) })
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    setUnread((c) => Math.max(0, c - 1))
  }

  function handleOpen() {
    setOpen((v) => !v)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        title={collapsed ? `Notifications${unread > 0 ? ` (${unread})` : ""}` : undefined}
        className={cn(
          "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 w-full",
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
          open ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/10 hover:text-white/90"
        )}
      >
        {/* Active left bar */}
        {!collapsed && (
          <span className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200",
            open ? "h-6 bg-accent-400" : "h-0 bg-accent-400/50 group-hover:h-5"
          )} />
        )}

        <span className={cn(
          "flex items-center justify-center shrink-0 transition-all duration-200 relative",
          open ? "text-accent-300" : "text-white/40 group-hover:text-white group-hover:scale-110"
        )}>
          {unread > 0 ? <BellDot className="h-[18px] w-[18px]" /> : <Bell className="h-[18px] w-[18px]" />}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>

        {!collapsed && <span className="truncate">Notifications</span>}
        {!collapsed && unread > 0 && (
          <span className="ml-auto shrink-0 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}

        {/* Tooltip when collapsed */}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 shadow-xl z-50 border border-white/10">
            Notifications{unread > 0 ? ` (${unread})` : ""}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className={cn(
          "absolute z-50 bottom-0 bg-white rounded-2xl shadow-2xl border border-gray-100 w-80",
          collapsed ? "left-14" : "left-full ml-2"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const inner = (
                  <div
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group flex gap-3",
                      !n.isRead && "bg-blue-50/60"
                    )}
                    onClick={() => { if (!n.isRead) markRead(n.id); if (!n.link) setOpen(false) }}
                  >
                    <div className={cn(
                      "mt-0.5 h-2 w-2 rounded-full shrink-0",
                      n.isRead ? "bg-transparent" : "bg-blue-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm leading-snug", n.isRead ? "text-gray-600" : "text-gray-900 font-medium")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.body}</p>
                      <p className="text-[11px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                )
                return n.link ? (
                  <Link key={n.id} href={n.link} onClick={() => { if (!n.isRead) markRead(n.id); setOpen(false) }}>
                    {inner}
                  </Link>
                ) : (
                  <div key={n.id}>{inner}</div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
