"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import {
  Kanban, ChevronDown, ChevronRight, Loader2,
  LayoutList, FileText, ExternalLink, Mail, Phone,
  Calendar, ArrowUpDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime, getInitials } from "@/lib/utils"
import { APPLICATION_STATUSES, SPECIALTIES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PIPELINE_STAGES = APPLICATION_STATUSES.filter((s) => s.step > 0).sort((a, b) => a.step - b.step)

const STAGE_COLORS: Record<string, string> = {
  APPLIED:   "bg-gray-100 text-gray-700",
  SCREENING: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  OFFER:     "bg-purple-100 text-purple-700",
  HIRED:     "bg-green-100 text-green-700",
}

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  APPLIED:   { label: "Applied",   color: "text-yellow-700", bg: "bg-yellow-100" },
  SCREENING: { label: "Screening", color: "text-blue-700",   bg: "bg-blue-100"   },
  INTERVIEW: { label: "Interview", color: "text-purple-700", bg: "bg-purple-100" },
  OFFER:     { label: "Offer",     color: "text-orange-700", bg: "bg-orange-100" },
  HIRED:     { label: "Hired",     color: "text-green-700",  bg: "bg-green-100"  },
  REJECTED:  { label: "Rejected",  color: "text-red-600",    bg: "bg-red-100"    },
  WITHDRAWN: { label: "Withdrawn", color: "text-gray-500",   bg: "bg-gray-100"   },
}

type Application = {
  id: string
  status: string
  appliedAt: string
  resumeUrlSnapshot?: string | null
  coverLetter?: string | null
  job: { id: string; title: string; specialty: string; location: string }
  candidateProfile: {
    id: string
    specialty?: string | null
    yearsExperience?: number | null
    phone?: string | null
    user: { name: string; email: string; avatarUrl?: string | null }
  }
}

// ── Kanban view ───────────────────────────────────────────────────────────────

function KanbanView({
  applications, movingId, onMove,
}: {
  applications: Application[]
  movingId: string | null
  onMove: (id: string, status: string) => void
}) {
  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.value] = applications.filter((a) => a.status === stage.value)
    return acc
  }, {} as Record<string, Application[]>)

  const rejected  = applications.filter((a) => a.status === "REJECTED")
  const withdrawn = applications.filter((a) => a.status === "WITHDRAWN")

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {PIPELINE_STAGES.map((stage) => {
          const cards = byStage[stage.value] ?? []
          return (
            <div key={stage.value} className="w-64 shrink-0">
              <div className={cn("rounded-xl px-3 py-2 mb-3 flex items-center justify-between", STAGE_COLORS[stage.value])}>
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">{cards.length}</span>
              </div>
              <div className="space-y-2">
                {cards.map((app) => (
                  <KanbanCard
                    key={app.id}
                    app={app}
                    currentStage={stage}
                    stages={PIPELINE_STAGES}
                    moving={movingId === app.id}
                    onMove={(toStatus) => onMove(app.id, toStatus)}
                  />
                ))}
                {cards.length === 0 && (
                  <div className="h-20 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                    <p className="text-xs text-gray-300">No candidates</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Terminal columns */}
        {[{ label: "Rejected", items: rejected }, { label: "Withdrawn", items: withdrawn }].map(({ label, items }) => (
          <div key={label} className="w-64 shrink-0">
            <div className="rounded-xl px-3 py-2 mb-3 flex items-center justify-between bg-red-50 text-red-600">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs font-bold bg-white/60 rounded-full px-2 py-0.5">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((app) => (
                <Card key={app.id} className="opacity-60">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                        {getInitials(app.candidateProfile.user.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{app.candidateProfile.user.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{app.job.title}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {items.length === 0 && (
                <div className="h-16 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                  <p className="text-xs text-gray-300">None</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KanbanCard({ app, currentStage, stages, moving, onMove }: {
  app: Application
  currentStage: typeof PIPELINE_STAGES[0]
  stages: typeof PIPELINE_STAGES
  moving: boolean
  onMove: (toStatus: string) => void
}) {
  const [showActions, setShowActions] = useState(false)
  const specLabel = SPECIALTIES.find((s) => s.value === app.candidateProfile.specialty)?.label

  const prevStage = stages.find((s) => s.step === currentStage.step - 1)
  const nextStage = stages.find((s) => s.step === currentStage.step + 1)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-[11px] font-bold text-primary-600 shrink-0">
            {getInitials(app.candidateProfile.user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{app.candidateProfile.user.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{app.job.title}</p>
          </div>
          {moving && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-500 shrink-0" />}
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          {specLabel && <Badge variant="outline" className="text-[10px] py-0">{specLabel}</Badge>}
          {app.candidateProfile.yearsExperience && (
            <Badge variant="secondary" className="text-[10px] py-0">{app.candidateProfile.yearsExperience}yr exp</Badge>
          )}
        </div>

        <p className="text-[10px] text-gray-400 mb-2">{formatRelativeTime(app.appliedAt)}</p>

        <button
          onClick={() => setShowActions(!showActions)}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-primary-500 transition-colors"
        >
          Move <ChevronDown className={cn("h-3 w-3 transition-transform", showActions && "rotate-180")} />
        </button>

        {showActions && (
          <div className="mt-2 space-y-1">
            {prevStage && (
              <button
                onClick={() => { onMove(prevStage.value); setShowActions(false) }}
                className="flex items-center gap-1 text-[11px] w-full px-2 py-1 rounded-lg hover:bg-gray-50 text-gray-500"
              >
                <ChevronDown className="h-3 w-3 rotate-90" /> {prevStage.label}
              </button>
            )}
            {nextStage && (
              <button
                onClick={() => { onMove(nextStage.value); setShowActions(false) }}
                className="flex items-center gap-1 text-[11px] w-full px-2 py-1 rounded-lg hover:bg-primary-50 text-primary-600 font-medium"
              >
                <ChevronRight className="h-3 w-3" /> {nextStage.label}
              </button>
            )}
            <button
              onClick={() => { onMove("REJECTED"); setShowActions(false) }}
              className="flex items-center gap-1 text-[11px] w-full px-2 py-1 rounded-lg hover:bg-red-50 text-red-500"
            >
              <ChevronDown className="h-3 w-3" /> Reject
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── List view ─────────────────────────────────────────────────────────────────

function ListView({
  applications, movingId, onMove,
}: {
  applications: Application[]
  movingId: string | null
  onMove: (id: string, status: string) => void
}) {
  const [sortBy, setSortBy] = useState<"date" | "name" | "status">("date")
  const [sortAsc, setSortAsc] = useState(false)

  function toggleSort(col: "date" | "name" | "status") {
    if (sortBy === col) setSortAsc((a) => !a)
    else { setSortBy(col); setSortAsc(true) }
  }

  const sorted = [...applications].sort((a, b) => {
    let cmp = 0
    if (sortBy === "date")   cmp = new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()
    if (sortBy === "name")   cmp = a.candidateProfile.user.name.localeCompare(b.candidateProfile.user.name)
    if (sortBy === "status") cmp = a.status.localeCompare(b.status)
    return sortAsc ? cmp : -cmp
  })

  function SortBtn({ col, label }: { col: "date" | "name" | "status"; label: string }) {
    return (
      <button
        onClick={() => toggleSort(col)}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
      >
        {label}
        <ArrowUpDown className={cn("h-3 w-3", sortBy === col && "text-primary-500")} />
      </button>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
        <LayoutList className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No applications yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <SortBtn col="name" label="Candidate" />
        <span className="text-xs font-semibold text-gray-500">Job</span>
        <SortBtn col="date" label="Applied" />
        <SortBtn col="status" label="Status" />
        <span className="text-xs font-semibold text-gray-500">Actions</span>
      </div>

      <div className="divide-y divide-gray-50">
        {sorted.map((app) => {
          const statusInfo = STATUS_BADGE[app.status] ?? { label: app.status, color: "text-gray-600", bg: "bg-gray-100" }
          const nextStage = PIPELINE_STAGES.find(
            (s) => s.step === (PIPELINE_STAGES.find((x) => x.value === app.status)?.step ?? 0) + 1
          )

          return (
            <div
              key={app.id}
              className="grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center hover:bg-gray-50 transition-colors"
            >
              {/* Candidate */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {getInitials(app.candidateProfile.user.name)}
                </div>
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/recruiter/candidates/${app.candidateProfile.id}`}
                    className="text-sm font-semibold text-gray-900 hover:text-primary-600 truncate block transition-colors"
                  >
                    {app.candidateProfile.user.name}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a
                      href={`mailto:${app.candidateProfile.user.email}`}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors truncate"
                    >
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{app.candidateProfile.user.email}</span>
                    </a>
                    {app.candidateProfile.phone && (
                      <a
                        href={`tel:${app.candidateProfile.phone}`}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-500 transition-colors shrink-0"
                      >
                        <Phone className="h-3 w-3" />
                        {app.candidateProfile.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Job */}
              <div className="min-w-0">
                <p className="text-sm text-gray-700 truncate font-medium">{app.job.title}</p>
                <p className="text-xs text-gray-400 truncate">{app.job.location}</p>
              </div>

              {/* Applied date */}
              <div>
                <p className="text-sm text-gray-700">{new Date(app.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeTime(app.appliedAt)}
                </p>
              </div>

              {/* Status */}
              <div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {movingId === app.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                ) : (
                  <>
                    {app.resumeUrlSnapshot && (
                      <a
                        href={app.resumeUrlSnapshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Resume"
                        className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-300 transition-colors"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {nextStage && !["HIRED", "REJECTED", "WITHDRAWN"].includes(app.status) && (
                      <button
                        onClick={() => onMove(app.id, nextStage.value)}
                        title={`Advance to ${nextStage.label}`}
                        className="h-8 px-3 rounded-lg border border-gray-200 flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                      >
                        <ChevronRight className="h-3.5 w-3.5" /> {nextStage.label}
                      </button>
                    )}
                    <Link
                      href={`/dashboard/recruiter/candidates/${app.candidateProfile.id}`}
                      title="View Profile"
                      className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-300 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────

function PipelineContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId") ?? undefined
  const [view, setView] = useState<"kanban" | "list">("kanban")
  const [movingId, setMovingId] = useState<string | null>(null)

  const url = jobId ? `/api/applications?jobId=${jobId}` : "/api/applications"
  const { data: applications, isLoading } = useSWR<Application[]>(url, fetcher)

  async function moveStage(appId: string, toStatus: string) {
    setMovingId(appId)
    await fetch(`/api/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: toStatus }),
    })
    await mutate(url)
    setMovingId(null)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {PIPELINE_STAGES.map((s) => <Skeleton key={s.value} className="h-64 rounded-xl" />)}
      </div>
    )
  }

  const apps = applications ?? []

  return (
    <div>
      {/* View toggle + stats */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{apps.length}</span> applicant{apps.length !== 1 ? "s" : ""}
          {jobId && <span className="text-xs text-gray-400">· filtered by job</span>}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              view === "kanban" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Kanban className="h-4 w-4" /> Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <LayoutList className="h-4 w-4" /> List
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanView applications={apps} movingId={movingId} onMove={moveStage} />
      ) : (
        <ListView applications={apps} movingId={movingId} onMove={moveStage} />
      )}
    </div>
  )
}

export default function RecruiterPipelinePage() {
  return (
    <div className="p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Kanban className="h-6 w-6 text-primary-500" /> Applicant Pipeline
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Use <strong>Kanban</strong> to move candidates through stages, or <strong>List</strong> to see contact details and track who applied when.
        </p>
      </div>
      <Suspense fallback={
        <div className="flex gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-64 h-64 rounded-xl" />)}
        </div>
      }>
        <PipelineContent />
      </Suspense>
    </div>
  )
}
