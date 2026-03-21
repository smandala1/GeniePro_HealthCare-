"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Briefcase, Search, Filter, ChevronLeft, ChevronRight as ChevronRightIcon,
  CheckCircle2, Clock, XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_VARIANT: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  ACTIVE:  "success",
  DRAFT:   "secondary",
  CLOSED:  "outline",
  EXPIRED: "destructive",
}

type Job = {
  id: string
  title: string
  specialty: string
  type: string
  location: string
  status: string
  isFeatured: boolean
  postedAt: string | null
  createdAt: string
  recruiterProfile: { company: string }
  _count: { applications: number }
}

export default function AdminJobsPage() {
  const [specialty, setSpecialty] = useState("")
  const [keyword, setKeyword]     = useState("")
  const [search, setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("ACTIVE")
  const [page, setPage]           = useState(1)

  const params = new URLSearchParams({ page: String(page), status: statusFilter })
  if (specialty) params.set("specialty", specialty)
  if (search)    params.set("keyword", search)

  const { data, isLoading } = useSWR(`/api/jobs?${params}`, fetcher)
  const jobs: Job[]         = data?.jobs ?? []
  const total: number       = data?.total ?? 0
  const totalPages: number  = data?.totalPages ?? 1

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">All Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? "Loading…" : `${total} jobs found`}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: "Active",  value: "ACTIVE",  icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
          { label: "Draft",   value: "DRAFT",   icon: <Clock className="h-3.5 w-3.5" /> },
          { label: "Closed",  value: "CLOSED",  icon: <XCircle className="h-3.5 w-3.5" /> },
          { label: "Expired", value: "EXPIRED", icon: <XCircle className="h-3.5 w-3.5" /> },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => { setStatusFilter(s.value); setPage(1) }}
            className={`flex items-center gap-1.5 h-8 px-3 rounded-full text-sm font-medium transition-colors ${
              statusFilter === s.value
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or location…"
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

      {/* Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-4 space-y-3">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </CardContent>
        ) : jobs.length === 0 ? (
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Job</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Specialty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Apps</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job) => {
                  const specLabel = SPECIALTIES.find((s) => s.value === job.specialty)?.label ?? job.specialty
                  return (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.recruiterProfile?.company} · {job.location}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-[11px]">{specLabel}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[job.status] ?? "outline"} className="text-[11px]">{job.status}</Badge>
                        {job.isFeatured && <Badge variant="default" className="text-[11px] ml-1">Featured</Badge>}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{job._count.applications}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {job.postedAt ? formatRelativeTime(job.postedAt) : formatDate(job.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
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
