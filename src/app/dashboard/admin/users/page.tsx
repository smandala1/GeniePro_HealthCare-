"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Users, Search, Filter, UserCheck, Building2,
  ShieldAlert, CheckCircle2, XCircle, ChevronLeft, ChevronRight as ChevronRightIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, getInitials } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ROLE_VARIANT: Record<string, "default" | "success" | "warning" | "secondary"> = {
  ADMIN:     "warning",
  RECRUITER: "default",
  CANDIDATE: "success",
}

const ROLE_ICON: Record<string, React.ReactNode> = {
  ADMIN:     <ShieldAlert className="h-3.5 w-3.5" />,
  RECRUITER: <Building2 className="h-3.5 w-3.5" />,
  CANDIDATE: <UserCheck className="h-3.5 w-3.5" />,
}

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  avatarUrl?: string | null
}

export default function AdminUsersPage() {
  const [role, setRole]       = useState("")
  const [keyword, setKeyword] = useState("")
  const [search, setSearch]   = useState("")
  const [page, setPage]       = useState(1)

  const params = new URLSearchParams({ page: String(page) })
  if (role)   params.set("role", role)
  if (search) params.set("keyword", search)

  const { data, isLoading } = useSWR(`/api/users?${params}`, fetcher)
  const users: User[]    = data?.users ?? []
  const totalPages: number = data?.totalPages ?? 1
  const total: number    = data?.total ?? 0

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? "Loading…" : `${total} registered users`}
        </p>
      </div>

      {/* Quick role stat chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "All",       value: "" },
          { label: "Candidates", value: "CANDIDATE" },
          { label: "Recruiters", value: "RECRUITER" },
          { label: "Admins",     value: "ADMIN" },
        ].map((r) => (
          <button
            key={r.value}
            onClick={() => { setRole(r.value); setPage(1) }}
            className={`h-8 px-3 rounded-full text-sm font-medium transition-colors ${
              role === r.value
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(keyword), setPage(1))}
            className="h-10 w-full pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <button
          onClick={() => { setSearch(keyword); setPage(1) }}
          className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" /> Search
        </button>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </CardContent>
        ) : users.length === 0 ? (
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-[11px] font-bold text-primary-600 shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_VARIANT[user.role] ?? "outline"} className="flex items-center gap-1 w-fit text-[11px]">
                        {ROLE_ICON[user.role]}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${user.isActive ? "text-green-600" : "text-red-400"}`}>
                        {user.isActive
                          ? <><CheckCircle2 className="h-3.5 w-3.5" /> Active</>
                          : <><XCircle className="h-3.5 w-3.5" /> Inactive</>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
