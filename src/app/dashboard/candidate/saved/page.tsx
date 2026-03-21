"use client"

import useSWR, { mutate } from "swr"
import Link from "next/link"
import { Bookmark, MapPin, Clock, Trash2, ChevronRight, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSalary, formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES, JOB_TYPES } from "@/lib/constants"
import { useState } from "react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SPECIALTY_BADGE: Record<string, "default" | "success" | "secondary" | "warning"> = {
  NURSING: "default",
  ALLIED_HEALTH: "success",
  NONCLINICAL: "secondary",
  PHARMA: "warning",
}

type SavedJobEntry = {
  id: string
  savedAt: string
  job: {
    id: string
    title: string
    specialty: string
    type: string
    location: string
    salaryMin?: number | null
    salaryMax?: number | null
    salaryType?: string
    isRemote: boolean
    postedAt: string | null
    recruiterProfile: { company: string }
    _count: { applications: number }
  }
}

export default function SavedJobsPage() {
  const { data: saved, isLoading } = useSWR<SavedJobEntry[]>("/api/saved", fetcher)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function removeJob(jobId: string) {
    setRemovingId(jobId)
    await fetch("/api/saved", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId }),
    })
    await mutate("/api/saved")
    setRemovingId(null)
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Saved Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? "Loading…" : `${saved?.length ?? 0} saved job${saved?.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : !saved || saved.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No saved jobs yet</p>
            <p className="text-gray-400 text-sm mt-1">Save jobs while browsing to revisit them later.</p>
            <Link href="/dashboard/candidate/jobs" className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary-500 hover:underline font-medium">
              Browse Jobs <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {saved.map(({ id, savedAt, job }) => {
            const specLabel = SPECIALTIES.find((s) => s.value === job.specialty)?.label ?? job.specialty
            const typeLabel = JOB_TYPES.find((t) => t.value === job.type)?.label ?? job.type
            return (
              <Card key={id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-0.5 line-clamp-2">
                        {job.title}
                      </h3>
                      <p className="text-xs text-gray-500">{job.recruiterProfile.company}</p>
                    </div>
                    <button
                      onClick={() => removeJob(job.id)}
                      disabled={removingId === job.id}
                      className="text-gray-300 hover:text-red-400 transition-colors mt-0.5 shrink-0"
                      title="Remove"
                    >
                      {removingId === job.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant={SPECIALTY_BADGE[job.specialty] ?? "outline"} className="text-[11px]">
                      {specLabel}
                    </Badge>
                    <Badge variant="outline" className="text-[11px]">{typeLabel}</Badge>
                    {job.isRemote && <Badge variant="secondary" className="text-[11px]">Remote</Badge>}
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                    </div>
                    <p className="text-[11px] text-gray-400">Saved {formatRelativeTime(savedAt)}</p>
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
          })}
        </div>
      )}
    </div>
  )
}
