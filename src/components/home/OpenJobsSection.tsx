"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Briefcase, Clock, ArrowRight, Building2 } from "lucide-react"

interface Job {
  id: string
  title: string
  specialty: string
  type: string
  location: string
  city?: string
  state?: string
  description: string
  postedAt?: string
  recruiterProfile: {
    company: string
    logoUrl?: string
  }
}

const SPECIALTY_COLORS: Record<string, string> = {
  NURSING: "bg-blue-50 text-blue-700",
  ALLIED_HEALTH: "bg-teal-50 text-teal-700",
  NONCLINICAL: "bg-purple-50 text-purple-700",
  PHARMA: "bg-green-50 text-green-700",
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  CONTRACT: "Contract",
  PER_DIEM: "Per Diem",
  TRAVEL: "Travel",
  TEMP: "Temp",
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return ""
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function OpenJobsSection() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/jobs?status=ACTIVE&limit=6")
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (jobs.length === 0) return null

  return (
    <section id="open-jobs" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2F80ED" }}>
              Now Hiring
            </p>
            <h2 className="text-4xl lg:text-5xl font-black leading-tight" style={{ color: "#1F2937" }}>
              Open Positions
            </h2>
            <p className="text-gray-500 text-base mt-3 max-w-lg">
              Browse verified healthcare roles and apply in under 30 seconds.
            </p>
          </div>
          <Link
            href="/jobs"
            className="hidden sm:flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors shrink-0"
          >
            View all jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Job Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => {
            const applyUrl = `/auth/register?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.recruiterProfile.company)}`
            const specialtyClass = SPECIALTY_COLORS[job.specialty] ?? "bg-gray-100 text-gray-600"
            const typeLabel = TYPE_LABELS[job.type] ?? job.type
            const location = [job.city, job.state].filter(Boolean).join(", ") || job.location

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{job.title}</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{job.recruiterProfile.company}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${specialtyClass}`}>
                    {job.specialty.replace("_", " ")}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {typeLabel}
                  </span>
                  {job.postedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo(job.postedAt)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
                  {job.description.replace(/<[^>]*>/g, "")}
                </p>

                {/* Apply button */}
                <Link
                  href={applyUrl}
                  className="mt-auto flex items-center justify-center gap-2 h-10 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                >
                  Apply Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            View all open positions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
