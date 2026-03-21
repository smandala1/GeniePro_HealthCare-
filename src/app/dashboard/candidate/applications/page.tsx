"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import {
  FileText, Clock, CheckCircle2, XCircle, ChevronRight,
  ExternalLink, X, Briefcase,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Map existing DB statuses → display labels + colors
const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string }> = {
  APPLIED:    { label: "Under Review",     color: "text-yellow-700", bg: "bg-yellow-100" },
  SCREENING:  { label: "Being Reviewed",   color: "text-blue-700",   bg: "bg-blue-100" },
  INTERVIEW:  { label: "Interview Scheduled", color: "text-purple-700", bg: "bg-purple-100" },
  OFFER:      { label: "Offer Extended",   color: "text-orange-700", bg: "bg-orange-100" },
  HIRED:      { label: "Accepted",         color: "text-green-700",  bg: "bg-green-100" },
  REJECTED:   { label: "Not Selected",     color: "text-red-600",    bg: "bg-red-100" },
  WITHDRAWN:  { label: "Withdrawn",        color: "text-gray-500",   bg: "bg-gray-100" },
}

type Application = {
  id: string
  status: string
  appliedAt: string
  coverLetter?: string | null
  resumeUrlSnapshot?: string | null
  job: {
    id: string
    title: string
    location: string
    specialty: string
    recruiterProfile: { company: string }
  }
  statusHistory: Array<{ toStatus: string; changedAt: string; note?: string | null }>
}

const SPECIALTY_COLORS: Record<string, string> = {
  NURSING:      "bg-blue-100 text-blue-700",
  ALLIED_HEALTH: "bg-teal-100 text-teal-700",
  NONCLINICAL:  "bg-purple-100 text-purple-700",
  PHARMA:       "bg-orange-100 text-orange-700",
}

function SuccessBanner({ jobTitle, onDismiss }: { jobTitle: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="flex items-start justify-between gap-4 rounded-2xl p-4 mb-6 text-white"
      style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">🎉</span>
        <div>
          <p className="font-semibold text-sm">Application submitted! We&apos;ll be in touch soon.</p>
          {jobTitle && (
            <p className="text-xs text-white/80 mt-0.5">
              Your application for <span className="font-medium text-white">{jobTitle}</span> has been received.
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function ApplicationsContent() {
  const searchParams = useSearchParams()
  const appliedParam = searchParams.get("applied")
  const jobTitleParam = searchParams.get("jobTitle") || ""
  const [showBanner, setShowBanner] = useState(appliedParam === "true")

  const { data: applications, isLoading } = useSWR<Application[]>("/api/applications", fetcher)

  const total    = applications?.length ?? 0
  const active   = applications?.filter((a) => ["SCREENING", "INTERVIEW", "OFFER"].includes(a.status)).length ?? 0
  const hired    = applications?.filter((a) => a.status === "HIRED").length ?? 0
  const rejected = applications?.filter((a) => a.status === "REJECTED").length ?? 0

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of all your job applications.</p>
      </div>

      {/* Success banner */}
      {showBanner && (
        <SuccessBanner
          jobTitle={decodeURIComponent(jobTitleParam)}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Applied",  value: total,    icon: <FileText className="h-5 w-5 text-blue-500" />,    bg: "bg-blue-50" },
          { label: "In Progress",    value: active,   icon: <Clock className="h-5 w-5 text-yellow-500" />,      bg: "bg-yellow-50" },
          { label: "Accepted",       value: hired,    icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,bg: "bg-green-50" },
          { label: "Not Selected",   value: rejected, icon: <XCircle className="h-5 w-5 text-red-400" />,       bg: "bg-red-50" },
        ].map(({ label, value, icon, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {isLoading
                  ? <Skeleton className="h-7 w-10 mt-1" />
                  : <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>}
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Application list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !applications || applications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">You haven&apos;t applied to any jobs yet.</p>
            <p className="text-gray-400 text-sm mt-1">Find a role that fits your skills and experience.</p>
            <Link
              href="/jobs"
              className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
            >
              Browse Open Jobs <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const statusInfo = STATUS_DISPLAY[app.status] ?? { label: app.status, color: "text-gray-600", bg: "bg-gray-100" }
            const specialtyColor = SPECIALTY_COLORS[app.job.specialty] ?? "bg-gray-100 text-gray-600"

            return (
              <Card key={app.id} className="overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <CardTitle className="text-base">{app.job.title}</CardTitle>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${specialtyColor}`}>
                          {app.job.specialty.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {app.job.recruiterProfile.company} · {app.job.location}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Applied {formatRelativeTime(app.appliedAt)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 flex items-center justify-between gap-4 flex-wrap">
                  {/* Status history */}
                  <div className="space-y-1 min-w-0 flex-1">
                    {app.statusHistory.length > 0 ? (
                      app.statusHistory.slice(0, 2).map((h, i) => {
                        const info = STATUS_DISPLAY[h.toStatus]
                        return (
                          <p key={i} className="text-xs text-gray-400">
                            <span className="font-medium text-gray-600">{info?.label ?? h.toStatus}</span>
                            {" — "}{formatRelativeTime(h.changedAt)}
                            {h.note && <span className="text-gray-400"> · {h.note}</span>}
                          </p>
                        )
                      })
                    ) : (
                      <p className="text-xs text-gray-400">Application received — under review</p>
                    )}
                  </div>

                  {/* Resume link */}
                  {app.resumeUrlSnapshot && (
                    <a
                      href={app.resumeUrlSnapshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline shrink-0"
                    >
                      View Resume <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function CandidateApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="p-6 lg:p-8 space-y-4">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  )
}
