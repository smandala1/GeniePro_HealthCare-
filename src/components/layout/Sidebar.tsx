"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard, User, Search, FileText, Bookmark,
  MessageSquare, Settings, Briefcase, Users, Building2,
  UserCheck, BarChart3, FileEdit, LogOut, Kanban, Star, Link2,
  ChevronLeft, ChevronRight, type LucideProps,
} from "lucide-react"
import { CANDIDATE_NAV, RECRUITER_NAV, ADMIN_NAV } from "@/lib/constants"
import { cn } from "@/lib/utils"

type IconComponent = React.ComponentType<LucideProps>

const ICON_MAP: Record<string, IconComponent> = {
  LayoutDashboard, User, Search, FileText, Bookmark,
  MessageSquare, Settings, Briefcase, Kanban, Users,
  Building2, UserCheck, BarChart3, FileEdit, Star, Link2,
}

interface SidebarProps {
  user: { id: string; name: string; email: string; role: string; avatarUrl?: string | null }
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed")
    if (stored === "true") setCollapsed(true)
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem("sidebar-collapsed", String(next))
    document.documentElement.style.setProperty("--sidebar-w", next ? "64px" : "240px")
  }

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", collapsed ? "64px" : "240px")
  }, [collapsed])

  const navItems =
    user.role === "ADMIN" ? ADMIN_NAV
    : user.role === "RECRUITER" ? RECRUITER_NAV
    : CANDIDATE_NAV

  const roleBase = `/dashboard/${user.role.toLowerCase()}`

  return (
    <aside className={cn(
      "fixed top-0 left-0 h-screen flex flex-col z-40 transition-all duration-300 ease-in-out",
      "bg-[#0f1f38] border-r border-white/10",
      collapsed ? "w-16" : "w-[240px]"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-white/10 shrink-0 relative",
        collapsed ? "justify-center" : "px-5"
      )}>
        <Link href={roleBase} className="flex items-center min-w-0">
          {collapsed ? (
            <img
              src="/Shorter_logo.png"
              alt="GeniePro"
              className="transition-all duration-300"
              style={{
                mixBlendMode: "screen",
                height: "100px",
                width: "100px",
                objectFit: "contain",
              }}
            />
          ) : (
            <img
              src="/GeniePro Health.png"
              alt="GeniePro Healthcare"
              className="transition-all duration-300"
              style={{
                mixBlendMode: "screen",
                height: "350px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </Link>

        <button
          onClick={toggle}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2",
            "h-6 w-6 rounded-full bg-[#0f1f38] border border-white/20",
            "flex items-center justify-center text-white/40",
            "hover:text-white hover:border-white/50 transition-all duration-200 shadow-md"
          )}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Role label */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/25">
            {user.role === "ADMIN" ? "Administration" : user.role === "RECRUITER" ? "Recruiter" : "Job Seeker"}
          </p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard
          const isActive =
            pathname === item.href ||
            (item.href !== roleBase && pathname.startsWith(item.href + "/"))

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white/90"
              )}
            >
              {/* Active left bar */}
              {!collapsed && (
                <span className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200",
                  isActive ? "h-6 bg-accent-400" : "h-0 bg-accent-400/50 group-hover:h-5"
                )} />
              )}

              {/* Icon */}
              <span className={cn(
                "flex items-center justify-center shrink-0 transition-all duration-200",
                isActive ? "text-accent-300" : "text-white/40 group-hover:text-white group-hover:scale-110"
              )}>
                <Icon className="h-[18px] w-[18px]" />
              </span>

              {!collapsed && (
                <span className={cn("truncate transition-all duration-200", !isActive && "group-hover:translate-x-0.5")}>
                  {item.label}
                </span>
              )}

              {/* Tooltip */}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 shadow-xl z-50 border border-white/10">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-2 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 mb-2 px-2 py-1.5 rounded-xl bg-white/5">
            <div className="h-8 w-8 rounded-full bg-accent-500/20 border border-accent-400/30 flex items-center justify-center shrink-0 text-xs font-bold text-accent-300">
              {getInitials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-white/90">{user.name}</p>
              <p className="text-[10px] text-white/35 truncate">{user.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2 py-1">
            <div title={user.name} className="h-8 w-8 rounded-full bg-accent-500/20 border border-accent-400/30 flex items-center justify-center text-xs font-bold text-accent-300 cursor-default">
              {getInitials(user.name)}
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm",
            "text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
