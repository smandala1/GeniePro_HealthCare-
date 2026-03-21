"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  UserCheck, Search, Filter, MapPin, ChevronLeft,
  ChevronRight as ChevronRightIcon, Briefcase,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/utils"
import { SPECIALTIES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SPECIALTY_BADGE: Record<string, "default" | "success" | "secondary" | "warning"> = {
  NURSING: "default",
  ALLIED_HEALTH: "success",
  NONCLINICAL: "secondary",
  PHARMA: "warning",
}

type Candidate = {
  id: string
  specialty?: string | null
  yearsExperience?: number | null
  availability?: string | null
  location?: string | null
  bio?: string | null
  user: { name: string; email: string; isActive: boolean }
  _count: { applications: number }
}

export default function AdminCandidatesPage() {
  const [specialty, setSpecialty] = useState("")
  const [keyword, setKeyword]     = useState("")
  const [search, setSearch]       = useState("")
  const [page, setPage]           = useState(1)

  const params = new URLSearchParams({ page: String(page) })
  if (specialty) params.set("specialty", specialty)
  if (search)    params.set("keyword", search)

  const { data, isLoading } = useSWR(`/api/candidates?${params}`, fetcher)
  const candidates: Candidate[] = data?.candidates ?? []
  const totalPages: number      = data?.totalPages ?? 1
  const total: number           = data?.total ?? 0

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">{isLoading ? "Loading…" : `${total} candidate profiles`}</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(keyword), setPage(1))}
            className="h-10 w-full pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
        <select
          value={specialty}
          onChange={(e) => { setSpecialty(e.target.value); setPage(1) }}
          className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        >
          <option value="">All Specialties</option>
          {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
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
      ) : candidates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <UserCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No candidates found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {candidates.map((c) => {
            const specLabel = SPECIALTIES.find((s) => s.value === c.specialty)?.label
            return (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 shrink-0">
                      {getInitials(c.user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{c.user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.user.email}</p>
                    </div>
                    <Badge variant={c.user.isActive ? "success" : "outline"} className="text-[10px] shrink-0 ml-auto">
                      {c.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {specLabel && (
                      <Badge variant={SPECIALTY_BADGE[c.specialty ?? ""] ?? "outline"} className="text-[11px]">
                        {specLabel}
                      </Badge>
                    )}
                    {c.yearsExperience && (
                      <Badge variant="secondary" className="text-[11px]">{c.yearsExperience}yr exp</Badge>
                    )}
                  </div>
                  <div className="space-y-1">
                    {c.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" /> {c.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Briefcase className="h-3.5 w-3.5 shrink-0" />
                      {c._count.applications} application{c._count.applications === 1 ? "" : "s"}
                    </div>
                  </div>
                  {c.bio && <p className="text-xs text-gray-400 line-clamp-2 mt-2">{c.bio}</p>}
                </CardContent>
              </Card>
            )
          })}
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
