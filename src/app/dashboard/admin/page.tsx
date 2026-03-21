"use client"

import useSWR from "swr"
import { useSession } from "next-auth/react"
import {
  Users,
  Briefcase,
  FileText,
  Activity,
  Loader2,
  TrendingUp,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SPECIALTY_COLORS: Record<string, string> = {
  NURSING: "#1e3a5f",
  ALLIED_HEALTH: "#0891b2",
  NONCLINICAL: "#7c3aed",
  PHARMA: "#ea580c",
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  RECRUITER: "bg-purple-100 text-purple-700",
  CANDIDATE: "bg-blue-100 text-blue-700",
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const { data, isLoading } = useSWR("/api/analytics", fetcher)

  const stats = data?.stats ?? {}
  const jobsBySpecialty: { specialty: string; count: number }[] = data?.jobsBySpecialty ?? []
  const appsByStatus: { status: string; count: number }[] = data?.appsByStatus ?? []
  const recentUsers: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
  }[] = data?.recentUsers ?? []

  const chartData = SPECIALTIES.map((sp) => ({
    name: sp.label,
    value: jobsBySpecialty.find((j) => j.specialty === sp.value)?.count ?? 0,
    color: SPECIALTY_COLORS[sp.value] ?? "#6b7280",
  }))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Admin Overview
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Welcome back, {session?.user?.name} — here&apos;s your platform summary
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5 text-primary-500" />}
          bg="bg-primary-50"
          loading={isLoading}
        />
        <StatCard
          label="Total Jobs"
          value={stats.totalJobs}
          icon={<Briefcase className="w-5 h-5 text-accent-500" />}
          bg="bg-accent-50"
          loading={isLoading}
        />
        <StatCard
          label="Applications"
          value={stats.totalApplications}
          icon={<FileText className="w-5 h-5 text-purple-500" />}
          bg="bg-purple-50"
          loading={isLoading}
        />
        <StatCard
          label="Active Jobs"
          value={stats.activeJobs}
          icon={<Activity className="w-5 h-5 text-green-500" />}
          bg="bg-green-50"
          loading={isLoading}
        />
      </div>

      {/* Charts + Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Jobs by specialty chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            <h2 className="font-semibold text-gray-900 text-sm">Jobs by Specialty</h2>
          </div>
          {isLoading ? (
            <div className="h-48 bg-gray-50 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={36}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Applications by status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 text-sm mb-5">Applications by Status</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : appsByStatus.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {appsByStatus.map((item) => {
                const maxCount = Math.max(...appsByStatus.map((a) => a.count), 1)
                const pct = Math.round((item.count / maxCount) * 100)
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 capitalize">
                        {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                      </span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Registrations</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : recentUsers.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">No users yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0 text-xs font-bold text-primary-700">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLOR[user.role] ?? "bg-gray-100 text-gray-600"}`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {formatRelativeTime(user.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  bg,
  loading,
}: {
  label: string
  value: number
  icon: React.ReactNode
  bg: string
  loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>{icon}</div>
      </div>
      {loading ? (
        <div className="h-7 w-16 bg-gray-100 animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-bold text-gray-900">{value ?? 0}</div>
      )}
    </div>
  )
}
