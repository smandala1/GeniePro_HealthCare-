"use client"

import { useState } from "react"
import useSWR from "swr"
import { Building2, Search, Filter, Globe, Phone, MapPin, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  recruiterProfile?: {
    company: string
    position?: string | null
    phone?: string | null
    website?: string | null
    city?: string | null
    state?: string | null
  } | null
}

export default function AdminRecruitersPage() {
  const [keyword, setKeyword] = useState("")
  const [search, setSearch]   = useState("")
  const [page, setPage]       = useState(1)

  const params = new URLSearchParams({ page: String(page), role: "RECRUITER" })
  if (search) params.set("keyword", search)

  const { data, isLoading } = useSWR(`/api/users?${params}`, fetcher)
  const users: User[]      = data?.users ?? []
  const totalPages: number  = data?.totalPages ?? 1
  const total: number       = data?.total ?? 0

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Recruiters</h1>
        <p className="text-sm text-gray-500 mt-1">{isLoading ? "Loading…" : `${total} recruiters registered`}</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or company…"
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

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No recruiters found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-11 w-11 rounded-xl bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-600 shrink-0">
                    {getInitials(user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Badge variant={user.isActive ? "success" : "outline"} className="text-[10px] shrink-0 ml-auto">
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {user.recruiterProfile ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                      <Building2 className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      {user.recruiterProfile.company}
                    </div>
                    {user.recruiterProfile.position && (
                      <p className="text-xs text-gray-400 pl-5">{user.recruiterProfile.position}</p>
                    )}
                    {(user.recruiterProfile.city || user.recruiterProfile.state) && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {[user.recruiterProfile.city, user.recruiterProfile.state].filter(Boolean).join(", ")}
                      </div>
                    )}
                    {user.recruiterProfile.website && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{user.recruiterProfile.website.replace(/^https?:\/\//, "")}</span>
                      </div>
                    )}
                    {user.recruiterProfile.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {user.recruiterProfile.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No company profile set up</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
              className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
