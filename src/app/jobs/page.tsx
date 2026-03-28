"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Search, MapPin, Clock, Briefcase, Building2,
  DollarSign, X, Filter, ChevronDown, Star, Users,
  ArrowLeft, CheckCircle2, Loader2, SlidersHorizontal,
  ArrowRight, Send,
} from "lucide-react"
import { SPECIALTIES, JOB_TYPES } from "@/lib/constants"
import ApplyModal from "@/components/ApplyModal"
import { useApplyModal } from "@/hooks/useApplyModal"

// ─── Types ──────────────────────────────────────────────────────────────────

type Job = {
  id: string
  title: string
  specialty: string
  subSpecialty?: string | null
  type: string
  location: string
  city?: string | null
  state?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryType?: string | null
  description: string
  requirements?: string | null
  benefits?: string | null
  isRemote: boolean
  isFeatured: boolean
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SPEC_STYLE: Record<string, { pill: string; label: string }> = {
  NURSING:      { pill: "bg-blue-50 text-blue-700",   label: "Nursing" },
  ALLIED_HEALTH:{ pill: "bg-teal-50 text-teal-700",   label: "Allied Health" },
  NONCLINICAL:  { pill: "bg-purple-50 text-purple-700",label: "Nonclinical" },
  PHARMA:       { pill: "bg-green-50 text-green-700", label: "Pharma" },
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return ""
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

const TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT:  "Contract",
  PER_DIEM:  "Per Diem",
  TRAVEL:    "Travel",
  TEMP:      "Temp",
}

function compactSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  const k = (n: number) => `$${Math.round(n / 1000)}k`
  if (min && max) return `${k(min)} – ${k(max)}`
  if (min) return `From ${k(min)}`
  return `Up to ${k(max!)}`
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ─── Job Card ────────────────────────────────────────────────────────────────

function JobCard({
  job, onView, onApply,
}: {
  job: Job
  onView: () => void
  onApply: () => void
}) {
  const spec = SPEC_STYLE[job.specialty] ?? { pill: "bg-gray-100 text-gray-600", label: job.specialty.toLowerCase() }
  const salary = compactSalary(job.salaryMin, job.salaryMax)
  const location = [job.city, job.state].filter(Boolean).join(", ") || job.location
  const typeLabel = TYPE_LABEL[job.type] ?? job.type

  return (
    <div className="bg-white rounded-[20px] border border-gray-100 p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      {/* Badges row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${spec.pill}`}>
          {spec.label}
        </span>
        {job.isFeatured && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-600">
            ⭐ Featured
          </span>
        )}
        {job.isRemote && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-50 text-green-700">
            Remote
          </span>
        )}
      </div>

      {/* Title & company */}
      <div>
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-1">{job.title}</h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{job.recruiterProfile.company}</span>
        </div>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          <MapPin className="w-3 h-3" />{location}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
          <Briefcase className="w-3 h-3" />{typeLabel}
        </span>
        {job.postedAt && (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">
            <Clock className="w-3 h-3" />{timeAgo(job.postedAt)}
          </span>
        )}
      </div>

      {/* Salary */}
      {salary && (
        <p className="text-sm font-bold text-[#2EC4B6] flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5" />{salary}
        </p>
      )}

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 flex-1">
        {job.description.replace(/<[^>]*>/g, "")}
      </p>

      {/* Buttons */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={onView}
          className="flex-1 h-10 flex items-center justify-center rounded-2xl border border-gray-200 text-gray-600 text-sm font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
        >
          View Job
        </button>
        <button
          onClick={onApply}
          className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
          style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
        >
          Quick Apply <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-100" />
        <div className="h-6 w-16 rounded-full bg-gray-100" />
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-100 rounded w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-100 rounded w-16" />
        <div className="h-9 bg-gray-200 rounded-xl w-28" />
      </div>
    </div>
  )
}

// ─── Job Detail Drawer ───────────────────────────────────────────────────────

function JobDrawer({ job, onClose, onOpenModal }: { job: Job; onClose: () => void; onOpenModal: () => void }) {
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState("")

  const spec = SPEC_STYLE[job.specialty] ?? { pill: "bg-gray-100 text-gray-600", label: job.specialty.toLowerCase() }
  const salary = compactSalary(job.salaryMin, job.salaryMax)
  const location = [job.city, job.state].filter(Boolean).join(", ") || job.location
  const typeLabel = TYPE_LABEL[job.type] ?? job.type

  const descLines = (job.description ?? "").split("\n").filter(Boolean)
  const reqLines  = (job.requirements ?? "").split("\n").filter(Boolean)
  const benLines  = (job.benefits ?? "").split("\n").filter(Boolean)

  // Quick apply for logged-in users
  async function handleQuickApply() {
    setApplying(true)
    setApplyError("")
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job.id }),
    })
    if (res.ok) {
      setApplied(true)
    } else if (res.status === 401) {
      // Not logged in → open apply modal
      onOpenModal()
      onClose()
    } else {
      const d = await res.json()
      setApplyError(d.error || "Failed to apply.")
    }
    setApplying(false)
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to results
          </button>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Job header */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-start gap-3 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${spec.pill}`}>
                {spec.label}
              </span>
              {job.isFeatured && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 shrink-0">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-3">{job.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-gray-400" />
                {job.recruiterProfile.company}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                {typeLabel}
              </span>
            </div>
            {salary && (
              <p className="text-xl font-bold flex items-center gap-1.5" style={{ color: "#2EC4B6" }}>
                <DollarSign className="h-5 w-5" />
                {salary}
              </p>
            )}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-6 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{job._count.applications}</p>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" /> Applicants
              </p>
            </div>
            <div className="px-6 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{job.viewCount}</p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
          </div>

          {/* Content sections */}
          <div className="px-6 py-5 space-y-6">
            {descLines.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 mb-3">Job Description</h2>
                <div className="space-y-2">
                  {descLines.map((line, i) => (
                    <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {reqLines.length > 0 && (
              <div>
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

            {benLines.length > 0 && (
              <div>
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

            {job.recruiterProfile.description && (
              <div>
                <h2 className="font-bold text-gray-900 mb-3">About the Employer</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{job.recruiterProfile.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Apply footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0">
          {applied ? (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Application submitted!</p>
                <p className="text-xs text-green-600">The recruiter will review your profile.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {applyError && (
                <p className="text-xs text-red-600 text-center">{applyError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleQuickApply}
                  disabled={applying}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                >
                  {applying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {applying ? "Applying…" : "Apply Now"}
                </button>
                <button
                  onClick={() => { onOpenModal(); onClose() }}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 text-gray-700 text-sm font-semibold hover:border-gray-300 transition-colors"
                >
                  Full Application <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400">
                &ldquo;Apply Now&rdquo; uses your saved profile · &ldquo;Full Application&rdquo; lets you add details
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { modalJob, openModal, closeModal } = useApplyModal()
  const [toast, setToast] = useState("")

  function handleSuccess() {
    setToast(`🎉 Application submitted! We'll be in touch soon.`)
    setTimeout(() => setToast(""), 5000)
  }

  // Search state
  const [keywordInput, setKeywordInput] = useState("")
  const [locationInput, setLocationInput] = useState("")
  const [activeKeyword, setActiveKeyword] = useState("")
  const [activeLocation, setActiveLocation] = useState("")

  // Filter state
  const [specialty, setSpecialty] = useState("")
  const [jobType, setJobType] = useState("")
  const [minSalary, setMinSalary] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Data state
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ status: "ACTIVE", limit: "50" })
      if (specialty) params.set("specialty", specialty)
      if (jobType) params.set("type", jobType)
      if (activeKeyword) params.set("keyword", activeKeyword)
      if (activeLocation) params.set("location", activeLocation)
      const data = await fetcher(`/api/jobs?${params}`)
      setJobs(data.jobs ?? [])
    } catch {
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [specialty, jobType, activeKeyword, activeLocation])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  // Client-side salary filter
  const filteredJobs = minSalary > 0
    ? jobs.filter((j) => !j.salaryMin || j.salaryMin >= minSalary)
    : jobs

  // Active filter count
  const filterCount = [specialty, jobType, minSalary > 0].filter(Boolean).length

  function handleSearch() {
    setActiveKeyword(keywordInput)
    setActiveLocation(locationInput)
  }

  function resetFilters() {
    setSpecialty("")
    setJobType("")
    setMinSalary(0)
    setActiveKeyword("")
    setActiveLocation("")
    setKeywordInput("")
    setLocationInput("")
  }


  const FiltersPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900">Filters</h2>
          {filterCount > 0 && (
            <span className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
              {filterCount}
            </span>
          )}
        </div>
        {filterCount > 0 && (
          <button onClick={resetFilters} className="text-xs text-blue-500 hover:underline font-medium">
            Reset all
          </button>
        )}
      </div>

      {/* Specialty */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Specialty</label>
        <div className="relative">
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Job Type</label>
        <div className="relative">
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all cursor-pointer"
          >
            <option value="">All Types</option>
            {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Salary slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Min Salary</label>
          <span className="text-xs font-semibold text-gray-700">
            {minSalary === 0 ? "$0k+" : `$${minSalary / 1000}k+`}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200000}
          step={10000}
          value={minSalary}
          onChange={(e) => setMinSalary(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #2F80ED ${(minSalary / 200000) * 100}%, #e5e7eb ${(minSalary / 200000) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1.5">
          <span>$0</span>
          <span>$200k+</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <Link href="/">
            <Image
              src="/GeniePro Health.png"
              alt="GeniePro Healthcare"
              width={120}
              height={40}
              style={{ mixBlendMode: "multiply", objectFit: "contain" }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/jobs" className="text-blue-600 font-semibold border-b-2 border-blue-500 pb-0.5">Find Jobs</Link>
            <Link href="/#specialties" className="text-gray-500 hover:text-gray-900 transition-colors">Specialties</Link>
            <Link href="/#for-employers" className="text-gray-500 hover:text-gray-900 transition-colors">For Employers</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-full transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Search Hero ── */}
      <div className="bg-white border-b border-gray-100 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-7">Find Your Next Position</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Keyword */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Job title, specialty, or keyword..."
                className="h-14 w-full pl-11 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
              />
            </div>
            {/* Location */}
            <div className="relative sm:w-64">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="City or State..."
                className="h-14 w-full pl-11 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all shadow-sm"
              />
            </div>
            {/* Search button */}
            <button
              onClick={handleSearch}
              className="h-14 px-8 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 shrink-0 shadow-sm"
              style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-7">

          {/* ── Left Sidebar — desktop ── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              {FiltersPanel}
            </div>
          </aside>

          {/* ── Right: Results ── */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-gray-600">
                {loading ? "Loading…" : `${filteredJobs.length} jobs found`}
              </p>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-600 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {filterCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
                <Search className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-600 font-semibold text-lg mb-1">No jobs found</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  <Filter className="h-4 w-4" /> Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={() => setSelectedJob(job)}
                    onApply={() => openModal({
                      id: job.id,
                      title: job.title,
                      company: job.recruiterProfile.company,
                      specialty: job.specialty,
                    })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filters drawer ── */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-2xl p-6 overflow-y-auto lg:hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900 text-lg">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            {FiltersPanel}
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full h-12 rounded-xl text-white font-semibold text-sm"
              style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
            >
              Show Results
            </button>
          </div>
        </>
      )}

      {/* ── Job Detail Drawer ── */}
      {selectedJob && (
        <JobDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onOpenModal={() => openModal({
            id: selectedJob.id,
            title: selectedJob.title,
            company: selectedJob.recruiterProfile.company,
            specialty: selectedJob.specialty,
          })}
        />
      )}

      {/* ── Apply Modal ── */}
      {modalJob && (
        <ApplyModal
          job={modalJob}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {/* ── Success Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-medium shadow-xl"
          style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
        >
          {toast}
          <button onClick={() => setToast("")} className="text-white/70 hover:text-white ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


    </div>
  )
}
