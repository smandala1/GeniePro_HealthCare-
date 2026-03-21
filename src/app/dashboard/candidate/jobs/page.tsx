"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  Search, MapPin, Clock, Bookmark, BookmarkCheck,
  ChevronRight, Filter, Loader2, Building2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSalary, formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES, JOB_TYPES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SPECIALTY_BADGE: Record<string, "default" | "success" | "secondary" | "warning"> = {
  NURSING: "default",
  ALLIED_HEALTH: "success",
  NONCLINICAL: "secondary",
  PHARMA: "warning",
}

export default function CandidateJobsPage() {
  const [specialty, setSpecialty] = useState("")
  const [type, setType] = useState("")
  const [keyword, setKeyword] = useState("")
  const [search, setSearch] = useState("")
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [savingId, setSavingId] = useState<string | null>(null)

  const params = new URLSearchParams({ status: "ACTIVE" })
  if (specialty) params.set("specialty", specialty)
  if (type) params.set("type", type)
  if (search) params.set("keyword", search)

  const { data, isLoading } = useSWR(`/api/jobs?${params}`, fetcher)
  const jobs: Job[] = data?.jobs ?? []

  async function toggleSave(jobId: string) {
    setSavingId(jobId)
    try {
      if (saved.has(jobId)) {
        await fetch("/api/saved", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) })
        setSaved(prev => { const s = new Set(prev); s.delete(jobId); return s })
      } else {
        await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) })
        setSaved(prev => { const s = new Set(prev); s.add(jobId); return s })
      }
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Find Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">Browse healthcare opportunities across all specialties.</p>
      </div>

      {/* Search + Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, skill, or location…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearch(keyword)}
                className="h-10 w-full pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
              />
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All Specialties</option>
              {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            >
              <option value="">All Types</option>
              {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <button
              onClick={() => setSearch(keyword)}
              className="h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
            >
              <Filter className="h-4 w-4" /> Search
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">{data?.total ?? 0} jobs found</p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={saved.has(job.id)}
                isSaving={savingId === job.id}
                onSave={() => toggleSave(job.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

type Job = {
  id: string
  title: string
  specialty: string
  type: string
  location: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: string
  isRemote: boolean
  isFeatured: boolean
  postedAt: string | null
  recruiterProfile: { company: string; logoUrl?: string | null }
  _count: { applications: number }
}

function JobCard({ job, isSaved, isSaving, onSave }: {
  job: Job
  isSaved: boolean
  isSaving: boolean
  onSave: () => void
}) {
  const specLabel = SPECIALTIES.find((s) => s.value === job.specialty)?.label ?? job.specialty
  const typeLabel = JOB_TYPES.find((t) => t.value === job.type)?.label ?? job.type

  return (
    <Card className={job.isFeatured ? "border-primary-200 shadow-md" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-primary-500" />
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="text-gray-400 hover:text-primary-500 transition-colors mt-0.5"
            title={isSaved ? "Unsave" : "Save job"}
          >
            {isSaving
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : isSaved
              ? <BookmarkCheck className="h-4 w-4 text-primary-500" />
              : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
          {job.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">{job.recruiterProfile.company}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant={SPECIALTY_BADGE[job.specialty] ?? "outline"} className="text-[11px]">
            {specLabel}
          </Badge>
          <Badge variant="outline" className="text-[11px]">{typeLabel}</Badge>
          {job.isRemote && <Badge variant="secondary" className="text-[11px]">Remote</Badge>}
          {job.isFeatured && <Badge variant="default" className="text-[11px]">Featured</Badge>}
        </div>

        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {job.location}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
          </div>
          {job.postedAt && (
            <p className="text-[11px] text-gray-400">{formatRelativeTime(job.postedAt)}</p>
          )}
        </div>

        <Link
          href={`/dashboard/candidate/jobs/${job.id}`}
          className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-primary-200 text-primary-600 text-xs font-medium hover:bg-primary-50 transition-colors"
        >
          View Job <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
