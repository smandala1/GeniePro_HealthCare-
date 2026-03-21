"use client"

import useSWR from "swr"
import {
  BarChart3, Users, Briefcase, FileText, TrendingUp,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts"
import { SPECIALTIES, APPLICATION_STATUSES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const SPECIALTY_COLORS: Record<string, string> = {
  NURSING:     "#1e3a5f",
  ALLIED_HEALTH: "#0891b2",
  NONCLINICAL: "#7c3aed",
  PHARMA:      "#d97706",
}

const STATUS_COLORS: Record<string, string> = {
  APPLIED:   "#94a3b8",
  SCREENING: "#3b82f6",
  INTERVIEW: "#f59e0b",
  OFFER:     "#8b5cf6",
  HIRED:     "#22c55e",
  REJECTED:  "#ef4444",
  WITHDRAWN: "#f97316",
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useSWR("/api/analytics", fetcher)

  const specialtyChartData = data?.jobsBySpecialty?.map((item: { specialty: string; count: number }) => ({
    name: SPECIALTIES.find((s) => s.value === item.specialty)?.label ?? item.specialty,
    jobs: item.count,
    fill: SPECIALTY_COLORS[item.specialty] ?? "#6b7280",
  })) ?? []

  const statusPieData = data?.appsByStatus?.map((item: { status: string; count: number }) => ({
    name: APPLICATION_STATUSES.find((s) => s.value === item.status)?.label ?? item.status,
    value: item.count,
    fill: STATUS_COLORS[item.status] ?? "#6b7280",
  })) ?? []

  const stats = [
    { label: "Total Users",        value: data?.totalUsers,        icon: <Users className="h-5 w-5 text-primary-500" />,   bg: "bg-primary-50" },
    { label: "Total Jobs",         value: data?.totalJobs,         icon: <Briefcase className="h-5 w-5 text-accent-500" />, bg: "bg-accent-50" },
    { label: "Applications",       value: data?.totalApplications, icon: <FileText className="h-5 w-5 text-purple-500" />,  bg: "bg-purple-50" },
    { label: "Active Jobs",        value: data?.activeJobs,        icon: <Activity className="h-5 w-5 text-green-500" />,   bg: "bg-green-50" },
  ]

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-500" /> Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide metrics and performance overview.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon, bg }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {isLoading
                  ? <Skeleton className="h-7 w-12 mt-1" />
                  : <p className="text-2xl font-bold mt-1 text-gray-900">{value ?? 0}</p>}
              </div>
              <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Jobs by specialty bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary-500" /> Jobs by Specialty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : specialtyChartData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={specialtyChartData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                    cursor={{ fill: "#f1f5f9" }}
                  />
                  <Bar dataKey="jobs" radius={[6, 6, 0, 0]}>
                    {specialtyChartData.map((entry: { fill: string }, index: number) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Applications by status pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent-500" /> Applications by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full rounded-xl" />
            ) : statusPieData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusPieData.map((entry: { fill: string }, index: number) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent registrations */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary-500" /> Recent Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : !data?.recentUsers || data.recentUsers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No users yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase">Name</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase">Email</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase">Role</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500 font-semibold uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentUsers.map((u: { id: string; name: string; email: string; role: string; createdAt: string }) => (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-medium text-gray-900">{u.name}</td>
                      <td className="py-2.5 px-3 text-gray-500 text-xs">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={u.role === "ADMIN" ? "warning" : u.role === "RECRUITER" ? "default" : "success"}
                          className="text-[10px]"
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
