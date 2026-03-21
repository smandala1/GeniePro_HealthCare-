"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft, MapPin, Clock, Building2,
  CheckCircle2, Loader2, Bookmark, BookmarkCheck,
  Star, Users, DollarSign, Send,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatSalary, formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES, JOB_TYPES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SPECIALTY_COLORS: Record<string, string> = {
  NURSING:       "bg-blue-50 text-blue-700 border border-blue-200",
  ALLIED_HEALTH: "bg-green-50 text-green-700 border border-green-200",
  NONCLINICAL:   "bg-purple-50 text-purple-700 border border-purple-200",
  PHARMA:        "bg-orange-50 text-orange-700 border border-orange-200",
}

type Job = {
  id: string
  title: string
  specialty: string
  type: string
  location: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryType?: string | null
  isRemote: boolean
  isFeatured: boolean
  description?: string | null
  requirements?: string | null
  benefits?: string | null
  experienceRequired?: number | null
  postedAt: string | null
  viewCount: number
  recruiterProfile: {
    company: string
    logoUrl?: string | null
    city?: string | null
    state?: string | null
    description?: string | null
  }
  _count: { applications: number }
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading } = useSWR<Job>(`/api/jobs/${id}`, fetcher)

  const [applying, setApplying]         = useState(false)
  const [applied, setApplied]           = useState(false)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [coverLetter, setCoverLetter]   = useState("")
  const [showCover, setShowCover]       = useState(false)
  const [applyError, setApplyError]     = useState("")

  async function handleApply() {
    setApplying(true)
    setApplyError("")
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: id, coverLetter: coverLetter || undefined }),
    })
    if (res.ok) {
      setApplied(true)
      setShowCover(false)
    } else {
      const d = await res.json()
      setApplyError(d.error || "Failed to apply. Please try again.")
    }
    setApplying(false)
  }

  async function toggleSave() {
    setSaving(true)
    if (saved) {
      await fetch("/api/saved", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: id }) })
      setSaved(false)
    } else {
      await fetch("/api/saved", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: id }) })
      setSaved(true)
    }
    setSaving(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-5xl space-y-4">
        <Skeleton className="h-4 w-28 mb-6" />
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-5xl">
        <Link href="/dashboard/candidate/jobs" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>
        <p className="text-gray-500">Job not found or no longer available.</p>
      </div>
    )
  }

  const specLabel = SPECIALTIES.find((s) => s.value === job.specialty)?.label ?? job.specialty
  const typeLabel = JOB_TYPES.find((t) => t.value === job.type)?.label ?? job.type
  const specColor = SPECIALTY_COLORS[job.specialty] ?? "bg-gray-50 text-gray-700 border border-gray-200"

  const descLines = (job.description ?? "").split("\n").filter(Boolean)
  const reqLines  = (job.requirements ?? "").split("\n").filter(Boolean)
  const benLines  = (job.benefits ?? "").split("\n").filter(Boolean)

  return (
    <div className="p-6 lg:p-8 w-full max-w-5xl">

      {/* Back */}
      <Link
        href="/dashboard/candidate/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${specColor}`}>
              {specLabel}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-gray-400" />
                {job.recruiterProfile.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                {typeLabel}
              </span>
            </div>
            {(job.salaryMin || job.salaryMax) && (
              <p className="text-lg font-bold flex items-center gap-1" style={{ color: "#2EC4B6" }}>
                <DollarSign className="h-5 w-5" />
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryType ?? undefined)}
              </p>
            )}
          </div>

          {/* Apply button — header */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {!applied && (
              <button
                onClick={() => setShowCover(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "#2EC4B6" }}
              >
                <Send className="h-4 w-4" /> Apply Now
              </button>
            )}
            <button
              onClick={toggleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <BookmarkCheck className="h-4 w-4 text-primary-500" /> : <Bookmark className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: description, requirements, benefits */}
        <div className="lg:col-span-2 space-y-4">

          {descLines.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Job Description</h2>
              <div className="space-y-2">
                {descLines.map((line, i) => (
                  <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}

          {benLines.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Benefits</h2>
              <ul className="space-y-2">
                {benLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {reqLines.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {reqLines.map((line, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-gray-400 shrink-0 mt-0.5">•</span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Quick Apply card */}
          <div className="rounded-2xl p-6 sticky top-6" style={{ background: "#0f1f38" }}>
            {applied ? (
              <div className="text-center py-2">
                <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-400" />
                </div>
                <p className="font-semibold text-white mb-1">Application Sent!</p>
                <p className="text-xs text-white/50 mb-4">The recruiter will review your profile and be in touch.</p>
                <Link
                  href="/dashboard/candidate/applications"
                  className="block text-center text-xs text-[#2EC4B6] hover:underline font-medium"
                >
                  View My Applications
                </Link>
              </div>
            ) : (
              <>
                <p className="font-bold text-white mb-1">Quick Apply</p>
                <p className="text-xs text-white/50 mb-4">Submit your application in just a few clicks.</p>

                {applyError && (
                  <div className="mb-3 p-2.5 bg-red-500/20 rounded-lg text-xs text-red-300">{applyError}</div>
                )}

                {showCover && (
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    placeholder="Cover letter (optional)…"
                    className="w-full mb-3 px-3 py-2.5 rounded-xl border border-white/10 bg-white/10 text-xs text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-[#2EC4B6]"
                  />
                )}

                <button
                  onClick={showCover ? handleApply : () => setShowCover(true)}
                  disabled={applying}
                  className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "#2EC4B6" }}
                >
                  {applying && <Loader2 className="h-4 w-4 animate-spin" />}
                  {applying ? "Submitting…" : showCover ? "Submit Application" : "Apply Now"}
                </button>

                {showCover && (
                  <button onClick={() => setShowCover(false)} className="w-full mt-2 text-xs text-white/40 hover:text-white/70 transition-colors">
                    Cancel
                  </button>
                )}
              </>
            )}
          </div>

          {/* Stats card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{job._count.applications}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" /> Applicants
                </p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{job.viewCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">Views</p>
              </div>
            </div>
          </div>

          {/* Employer card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">About the Employer</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{job.recruiterProfile.company}</p>
                {(job.recruiterProfile.city || job.recruiterProfile.state) && (
                  <p className="text-xs text-gray-400">{[job.recruiterProfile.city, job.recruiterProfile.state].filter(Boolean).join(", ")}</p>
                )}
              </div>
            </div>
            {job.recruiterProfile.description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{job.recruiterProfile.description}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
