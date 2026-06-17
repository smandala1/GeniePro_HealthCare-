"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Briefcase, Users, Clock, Plus,
  ChevronRight, FileText, ArrowRight, TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"
import { APPLICATION_STATUSES, SPECIALTIES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_VARIANT: Record<string, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  APPLIED:   "outline",
  SCREENING: "default",
  INTERVIEW: "warning",
  OFFER:     "secondary",
  HIRED:     "success",
  REJECTED:  "destructive",
  WITHDRAWN: "secondary",
}

const FUNNEL_STAGES = [
  { key: "APPLIED",   label: "Applied",    color: "#6B7280", bg: "bg-gray-100" },
  { key: "SCREENING", label: "Screening",  color: "#2F80ED", bg: "bg-blue-100" },
  { key: "INTERVIEW", label: "Interview",  color: "#7C3AED", bg: "bg-purple-100" },
  { key: "OFFER",     label: "Offer",      color: "#D97706", bg: "bg-yellow-100" },
  { key: "HIRED",     label: "Hired",      color: "#16a34a", bg: "bg-green-100" },
]

export default function RecruiterDashboard() {
  const { data: session } = useSession()
  const { data: applications, isLoading } = useSWR("/api/applications", fetcher)
  const { data: jobsData } = useSWR("/api/jobs?mine=true&status=ACTIVE&limit=50", fetcher)

  const apps: { status: string; jobId: string; appliedAt: string; job: { title: string; specialty: string }; candidateProfile: { user: { name: string; email: string } } }[] = applications ?? []

  const activeJobs = jobsData?.total ?? 0
  const totalApps  = apps.length
  const newApps    = apps.filter((a) => a.status === "APPLIED").length
  const inReview   = apps.filter((a) => ["SCREENING", "INTERVIEW"].includes(a.status)).length

  // Funnel counts
  const funnelCounts = FUNNEL_STAGES.map((s) => ({
    ...s,
    count: apps.filter((a) => a.status === s.key).length,
  }))
  const maxCount = Math.max(...funnelCounts.map((s) => s.count), 1)

  const recentApps = apps.slice(0, 6)

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {isLoading ? "Loading…" : `Welcome back, ${session?.user?.name?.split(" ")[0] ?? "there"} 👋`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your job postings and review candidates.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active Jobs"      value={activeJobs} icon={<Briefcase className="h-5 w-5 text-primary-500" />} bg="bg-primary-50" loading={isLoading} />
        <StatCard label="Total Applicants" value={totalApps}  icon={<Users className="h-5 w-5 text-accent-500" />}     bg="bg-accent-50"  loading={isLoading} />
        <StatCard label="New (Applied)"    value={newApps}    icon={<FileText className="h-5 w-5 text-blue-500" />}     bg="bg-blue-50"    loading={isLoading} />
        <StatCard label="In Review"        value={inReview}   icon={<Clock className="h-5 w-5 text-yellow-500" />}     bg="bg-yellow-50"  loading={isLoading} />
      </div>

      {/* Pipeline funnel */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" /> Application Funnel
            </CardTitle>
            <Link href="/dashboard/recruiter/pipeline" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              Full pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          {isLoading ? (
            <div className="flex gap-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 flex-1 rounded-xl" />)}
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              {funnelCounts.map(({ key, label, color, bg, count }) => {
                const barH = Math.max(16, Math.round((count / maxCount) * 96))
                return (
                  <div key={key} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{count}</span>
                    <div
                      className={`w-full rounded-t-lg ${bg} transition-all duration-500`}
                      style={{ height: barH, minHeight: 16, background: `${color}22`, borderTop: `3px solid ${color}` }}
                    />
                    <span className="text-[11px] text-gray-500 text-center leading-tight">{label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-8 px-4 py-3 rounded-xl bg-white border border-gray-100 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-gray-800">Post a New Job</p>
          <p className="text-xs text-gray-400 mt-0.5">Create a listing to start receiving applications</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/recruiter/jobs">
            <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm">
              <Plus className="h-3.5 w-3.5" /> Post Job
            </button>
          </Link>
          <Link href="/dashboard/recruiter/pipeline">
            <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-500 transition-colors shadow-sm">
              <Users className="h-3.5 w-3.5" /> Pipeline
            </button>
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-gray-900">Recent Applications</h2>
            <Link href="/dashboard/recruiter/pipeline" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              View pipeline <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : recentApps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">No applications yet</p>
                <Link href="/dashboard/recruiter/jobs">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:underline">
                    Post a job to get started <Plus className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => {
                const statusInfo = APPLICATION_STATUSES.find((s) => s.value === app.status)
                const specialty  = SPECIALTIES.find((s) => s.value === app.job?.specialty)
                return (
                  <Card key={`${app.jobId}-${app.appliedAt}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-accent-50 flex items-center justify-center shrink-0 text-xs font-bold text-accent-700">
                          {app.candidateProfile?.user?.name?.charAt(0) ?? "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="font-medium text-sm text-gray-900">
                              {app.candidateProfile?.user?.name ?? "Candidate"}
                            </p>
                            <Badge variant={STATUS_VARIANT[app.status] ?? "outline"}>
                              {statusInfo?.label ?? app.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="truncate">{app.job?.title}</span>
                            {specialty && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary-50 text-primary-700">
                                {specialty.label}
                              </span>
                            )}
                            <span>· {formatRelativeTime(app.appliedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-gray-400">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {[
                { href: "/dashboard/recruiter/jobs",       icon: Briefcase,    label: "Job Postings" },
                { href: "/dashboard/recruiter/pipeline",   icon: Users,        label: "Applicant Pipeline" },
                { href: "/dashboard/recruiter/candidates", icon: ChevronRight, label: "Candidate Pool" },
                { href: "/dashboard/recruiter/company",    icon: ChevronRight, label: "Company Profile" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 py-1.5 transition-colors">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Tip card */}
          <Card className="border-primary-100 bg-primary-50/40">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-primary-700 mb-1">Pro Tip</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Add salary ranges to your job listings — postings with pay info get up to 3× more applicants.
              </p>
              <Link href="/dashboard/recruiter/jobs" className="text-xs text-primary-500 font-medium mt-2 inline-block hover:underline">
                Edit a job →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, bg, loading,
}: { label: string; value: number; icon: React.ReactNode; bg: string; loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            {loading
              ? <Skeleton className="h-7 w-10 mt-1" />
              : <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
            }
          </div>
          <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
