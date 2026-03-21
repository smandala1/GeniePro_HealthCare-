"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  Briefcase, Plus, Edit3, Eye,
  Loader2, Search, CheckCircle2, Clock, BarChart3,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES, JOB_TYPES } from "@/lib/constants"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_VARIANT: Record<string, "default" | "success" | "secondary" | "outline"> = {
  ACTIVE: "success",
  DRAFT: "secondary",
  CLOSED: "outline",
  EXPIRED: "outline",
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
  _count: { applications: number }
}

type PostJobForm = {
  title: string
  specialty: string
  type: string
  location: string
  salaryMin: string
  salaryMax: string
  description: string
  requirements: string
  benefits: string
  experienceRequired: string
  publish: boolean
}

const EMPTY_FORM: PostJobForm = {
  title: "", specialty: "", type: "", location: "",
  salaryMin: "", salaryMax: "", description: "",
  requirements: "", benefits: "", experienceRequired: "",
  publish: false,
}

export default function RecruiterJobsPage() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<PostJobForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [filter, setFilter] = useState("")

  const { data, isLoading } = useSWR("/api/jobs?mine=true&status=ACTIVE&limit=50", fetcher)
  const { data: drafts } = useSWR("/api/jobs?mine=true&status=DRAFT&limit=50", fetcher)

  const jobs: Job[] = [
    ...(data?.jobs ?? []),
    ...(drafts?.jobs ?? []),
  ]

  const filtered = filter
    ? jobs.filter((j) => j.title.toLowerCase().includes(filter.toLowerCase()) || j.specialty === filter)
    : jobs

  const activeCount  = jobs.filter((j) => j.status === "ACTIVE").length
  const draftCount   = jobs.filter((j) => j.status === "DRAFT").length
  const totalApps    = jobs.reduce((sum, j) => sum + j._count.applications, 0)

  function update(field: string, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function submitJob(publish: boolean) {
    setSubmitting(true)
    setFormError("")
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        salaryMin:          form.salaryMin ? parseInt(form.salaryMin) : null,
        salaryMax:          form.salaryMax ? parseInt(form.salaryMax) : null,
        experienceRequired: form.experienceRequired ? parseInt(form.experienceRequired) : null,
        publish,
      }),
    })
    if (res.ok) {
      setForm(EMPTY_FORM)
      setShowForm(false)
      await mutate("/api/jobs?mine=true&status=ACTIVE&limit=50")
      await mutate("/api/jobs?mine=true&status=DRAFT&limit=50")
    } else {
      const d = await res.json()
      setFormError(d.error || "Failed to post job")
    }
    setSubmitting(false)
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Job Postings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your open positions.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Post a Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Active",    value: activeCount, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,  bg: "bg-green-50" },
          { label: "Drafts",    value: draftCount,  icon: <Clock className="h-5 w-5 text-gray-400" />,          bg: "bg-gray-50" },
          { label: "Total Apps",value: totalApps,   icon: <BarChart3 className="h-5 w-5 text-primary-500" />,   bg: "bg-primary-50" },
        ].map(({ label, value, icon, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {isLoading
                  ? <Skeleton className="h-7 w-10 mt-1" />
                  : <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>}
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New job form */}
      {showForm && (
        <Card className="mb-6 border-primary-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary-500" /> New Job Posting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{formError}</div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Job Title">
                <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. ICU Registered Nurse" className={inputCls} required />
              </Field>
              <Field label="Specialty">
                <select value={form.specialty} onChange={(e) => update("specialty", e.target.value)} className={inputCls}>
                  <option value="">Select specialty</option>
                  {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </Field>
              <Field label="Job Type">
                <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputCls}>
                  <option value="">Select type</option>
                  {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State or Remote" className={inputCls} />
              </Field>
              <Field label="Salary Min ($)">
                <input type="number" value={form.salaryMin} onChange={(e) => update("salaryMin", e.target.value)} placeholder="e.g. 70000" className={inputCls} />
              </Field>
              <Field label="Salary Max ($)">
                <input type="number" value={form.salaryMax} onChange={(e) => update("salaryMax", e.target.value)} placeholder="e.g. 95000" className={inputCls} />
              </Field>
              <Field label="Years Experience Required">
                <input type="number" min={0} value={form.experienceRequired} onChange={(e) => update("experienceRequired", e.target.value)} placeholder="e.g. 2" className={inputCls} />
              </Field>
            </div>
            <Field label="Job Description">
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="Describe the role, responsibilities, and what makes it great…" className={`${inputCls} h-auto`} />
            </Field>
            <Field label="Requirements">
              <textarea value={form.requirements} onChange={(e) => update("requirements", e.target.value)} rows={3} placeholder="Required qualifications, licenses, certifications…" className={`${inputCls} h-auto`} />
            </Field>
            <Field label="Benefits (optional)">
              <textarea value={form.benefits} onChange={(e) => update("benefits", e.target.value)} rows={2} placeholder="Health insurance, 401k, sign-on bonus…" className={`${inputCls} h-auto`} />
            </Field>
            <div className="flex gap-3">
              <button
                onClick={() => submitJob(false)}
                disabled={submitting}
                className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Save as Draft
              </button>
              <button
                onClick={() => submitJob(true)}
                disabled={submitting}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Publish Job
              </button>
              <button onClick={() => setShowForm(false)} className="ml-auto h-10 px-3 rounded-xl text-gray-400 hover:text-gray-600 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by title…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-10 w-full pl-9 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          />
        </div>
      </div>

      {/* Job list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No jobs posted yet</p>
            <p className="text-gray-400 text-sm mt-1">Click &ldquo;Post a Job&rdquo; to create your first listing.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const specLabel = SPECIALTIES.find((s) => s.value === job.specialty)?.label ?? job.specialty
            return (
              <Card key={job.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm text-gray-900 truncate">{job.title}</p>
                      <Badge variant={STATUS_VARIANT[job.status] ?? "outline"} className="text-[11px]">{job.status}</Badge>
                      <Badge variant="outline" className="text-[11px]">{specLabel}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.location} · {job._count.applications} applicant{job._count.applications === 1 ? "" : "s"}
                      {job.postedAt ? ` · Posted ${formatRelativeTime(job.postedAt)}` : ` · Created ${formatDate(job.createdAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/recruiter/pipeline?jobId=${job.id}`}
                      className="h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" /> Pipeline
                    </Link>
                    <button className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-200 transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

const inputCls = "h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
