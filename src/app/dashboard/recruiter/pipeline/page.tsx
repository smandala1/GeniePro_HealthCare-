"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import {
  Kanban, ChevronDown, ChevronRight,
  Loader2,
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

type Application = {
  id: string
  status: string
  appliedAt: string
  job: { id: string; title: string; specialty: string }
  candidateProfile: {
    specialty?: string | null
    yearsExperience?: number | null
    user: { name: string; email: string; avatarUrl?: string | null }
  }
}

function PipelineContent() {
  const searchParams = useSearchParams()
  const jobId = searchParams.get("jobId") ?? undefined
  const [movingId, setMovingId] = useState<string | null>(null)

  const url = jobId ? `/api/applications?jobId=${jobId}` : "/api/applications"
  const { data: applications, isLoading } = useSWR<Application[]>(url, fetcher)

  const byStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.value] = applications?.filter((a) => a.status === stage.value) ?? []
    return acc
  }, {} as Record<string, Application[]>)

  const rejected  = applications?.filter((a) => a.status === "REJECTED") ?? []
  const withdrawn = applications?.filter((a) => a.status === "WITHDRAWN") ?? []

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
                  <CandidateCard
                    key={app.id}
                    app={app}
                    currentStage={stage}
                    stages={PIPELINE_STAGES}
                    moving={movingId === app.id}
                    onMove={(toStatus) => moveStage(app.id, toStatus)}
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

function CandidateCard({ app, currentStage, stages, moving, onMove }: {
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

        {/* Actions */}
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

export default function RecruiterPipelinePage() {
  return (
    <div className="p-6 lg:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Kanban className="h-6 w-6 text-primary-500" /> Applicant Pipeline
        </h1>
        <p className="text-sm text-gray-500 mt-1">Drag candidates through your hiring stages.</p>
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
