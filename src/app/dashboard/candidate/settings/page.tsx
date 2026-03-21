"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Settings, Lock, Bell, Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CandidateSettingsPage() {
  const { data: session } = useSession()
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })
  const [notifications, setNotifications] = useState({
    newMessages: true,
    applicationUpdates: true,
    jobAlerts: false,
    weeklyDigest: false,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pwError, setPwError] = useState("")

  async function savePassword() {
    if (passwords.next !== passwords.confirm) {
      setPwError("Passwords do not match")
      return
    }
    if (passwords.next.length < 8) {
      setPwError("Password must be at least 8 characters")
      return
    }
    setSaving(true)
    setPwError("")
    // Would call /api/users/[id] or a dedicated password-change endpoint
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setSaved(true)
    setPasswords({ current: "", next: "", confirm: "" })
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="space-y-5">
        {/* Account info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary-500" /> Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Full Name</label>
              <input
                type="text"
                defaultValue={session?.user?.name ?? ""}
                className={inputCls}
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                defaultValue={session?.user?.email ?? ""}
                className={inputCls}
                readOnly
              />
              <p className="text-xs text-gray-400">Email cannot be changed. Contact support if needed.</p>
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary-500" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pwError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" /> {pwError}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">New Password</label>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat password"
                  className={inputCls}
                />
              </div>
            </div>
            <button
              onClick={savePassword}
              disabled={saving || !passwords.current || !passwords.next}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {saving ? "Saving…" : saved ? "Updated!" : "Update Password"}
            </button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary-500" /> Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(notifications) as Array<keyof typeof notifications>).map((key) => {
              const labels: Record<string, string> = {
                newMessages: "New messages from recruiters",
                applicationUpdates: "Application status updates",
                jobAlerts: "New job alerts matching your profile",
                weeklyDigest: "Weekly job digest email",
              }
              return (
                <label key={key} className="flex items-center justify-between py-2 cursor-pointer">
                  <span className="text-sm text-gray-700">{labels[key]}</span>
                  <button
                    onClick={() => setNotifications((n) => ({ ...n, [key]: !n[key] }))}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${
                      notifications[key] ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      notifications[key] ? "translate-x-4" : "translate-x-0"
                    }`} />
                  </button>
                </label>
              )
            })}
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-red-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2 text-red-600">
              <Shield className="h-4 w-4" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Deleting your account is permanent and cannot be undone. All your data will be removed.
            </p>
            <button className="h-10 px-4 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors">
              Delete Account
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const inputCls = "h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all"
