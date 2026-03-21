"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  FileText, Search, Bookmark, CheckCircle2,
  Clock, ChevronRight, ArrowUpRight, ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"
import { APPLICATION_STATUSES } from "@/lib/constants"

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

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const { data: applications, isLoading } = useSWR("/api/applications", fetcher)

  const total   = applications?.length ?? 0
  const active  = applications?.filter((a: { status: string }) => ["SCREENING", "INTERVIEW", "OFFER"].includes(a.status)).length ?? 0
  const hired   = applications?.filter((a: { status: string }) => a.status === "HIRED").length ?? 0
  const recent  = applications?.slice(0, 5) ?? []

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {isLoading ? "Loading…" : `Welcome back, ${session?.user?.name?.split(" ")[0] ?? "there"} 👋`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s your job search overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Applications" value={total} icon={<FileText className="h-5 w-5 text-primary-500" />} bg="bg-primary-50" loading={isLoading} />
        <StatCard label="In Progress"         value={active} icon={<Clock className="h-5 w-5 text-yellow-500" />}   bg="bg-yellow-50"  loading={isLoading} />
        <StatCard label="Hired"               value={hired}  icon={<CheckCircle2 className="h-5 w-5 text-green-500" />} bg="bg-green-50" loading={isLoading} />
        <StatCard label="Saved Jobs"          value={0}      icon={<Bookmark className="h-5 w-5 text-accent-500" />} bg="bg-accent-50" loading={isLoading} />
      </div>

      {/* Quick actions + Recent in two-column grid */}
      <div className="grid lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {/* Recent applications */}
        <div className="lg:col-span-2 xl:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-gray-900">Recent Applications</h2>
            <Link href="/dashboard/candidate/applications" className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : recent.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">No applications yet</p>
                <Link href="/dashboard/candidate/jobs">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-500 hover:underline">
                    Browse open jobs <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recent.map((app: {
                id: string; status: string; appliedAt: string
                job: { title: string; location: string; recruiterProfile: { company: string } }
              }) => {
                const statusInfo = APPLICATION_STATUSES.find((s) => s.value === app.status)
                return (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="h-4 w-4 text-primary-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <p className="font-medium text-sm text-gray-900 truncate">{app.job.title}</p>
                            <Badge variant={STATUS_VARIANT[app.status] ?? "outline"}>
                              {statusInfo?.label ?? app.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-400">
                            {app.job.recruiterProfile?.company} · {app.job.location} · {formatRelativeTime(app.appliedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick links sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wide text-gray-400">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {[
                { href: "/dashboard/candidate/jobs",         icon: Search,    label: "Find Jobs" },
                { href: "/dashboard/candidate/applications", icon: FileText,  label: "My Applications" },
                { href: "/dashboard/candidate/saved",        icon: Bookmark,  label: "Saved Jobs" },
                { href: "/dashboard/candidate/profile",      icon: ChevronRight, label: "Edit Profile" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 py-1.5 transition-colors"
                >
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
