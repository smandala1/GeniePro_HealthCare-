"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Briefcase, Users, Clock, Plus,
  ChevronRight, FileText, ArrowRight,
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

export default function RecruiterDashboard() {
  const { data: session } = useSession()
  const { data: applications, isLoading } = useSWR("/api/applications", fetcher)

  const totalApps  = applications?.length ?? 0
  const newApps    = applications?.filter((a: { status: string }) => a.status === "APPLIED").length ?? 0
  const inReview   = applications?.filter((a: { status: string }) => ["SCREENING", "INTERVIEW"].includes(a.status)).length ?? 0
  const uniqueJobs = applications
    ? new Set(applications.map((a: { jobId: string }) => a.jobId)).size
    : 0

  const recentApps = applications?.slice(0, 6) ?? []

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Jobs"      value={uniqueJobs} icon={<Briefcase className="h-5 w-5 text-primary-500" />} bg="bg-primary-50" loading={isLoading} />
        <StatCard label="Total Applicants" value={totalApps}  icon={<Users className="h-5 w-5 text-accent-500" />}     bg="bg-accent-50"  loading={isLoading} />
        <StatCard label="New (Applied)"    value={newApps}    icon={<FileText className="h-5 w-5 text-blue-500" />}     bg="bg-blue-50"    loading={isLoading} />
        <StatCard label="In Review"        value={inReview}   icon={<Clock className="h-5 w-5 text-yellow-500" />}     bg="bg-yellow-50"  loading={isLoading} />
      </div>

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
              {recentApps.map((app: {
                id: string; status: string; appliedAt: string
                job: { title: string; specialty: string }
                candidateProfile: { user: { name: string; email: string } }
              }) => {
                const statusInfo = APPLICATION_STATUSES.find((s) => s.value === app.status)
                const specialty  = SPECIALTIES.find((s) => s.value === app.job.specialty)
                return (
                  <Card key={app.id}>
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
                            <span className="truncate">{app.job.title}</span>
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
