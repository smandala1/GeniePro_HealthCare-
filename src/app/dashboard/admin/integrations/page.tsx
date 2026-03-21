"use client"

import { useState } from "react"
import {
  Link2, CheckCircle2, XCircle, RefreshCw, Download,
  Users, Briefcase, AlertCircle, ChevronRight, Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SyncResult = {
  ok: boolean
  fetched: number
  created: number
  updated: number
  skipped: number
  errors: string[]
  syncedAt: string
}

type StatusInfo = {
  syncedJobCount: number
  isConfigured: boolean
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
        ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
      }`}
    >
      {ok
        ? <CheckCircle2 className="w-3.5 h-3.5" />
        : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  )
}

export default function IntegrationsPage() {
  const [status, setStatus]       = useState<StatusInfo | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [syncing, setSyncing]     = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [syncError, setSyncError] = useState("")
  const [postedAgoDays, setPostedAgoDays] = useState("30")
  const [jobStatus, setJobStatus] = useState("Open")

  async function loadStatus() {
    setStatusLoading(true)
    try {
      const res = await fetch("/api/ceipal/sync-jobs")
      if (res.ok) setStatus(await res.json())
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    setSyncError("")
    try {
      const res = await fetch("/api/ceipal/sync-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posted_ago_days: postedAgoDays || undefined,
          job_status:      jobStatus     || undefined,
          limit:           "100",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSyncError(data.error ?? "Sync failed")
      } else {
        setSyncResult(data)
        // Refresh status count
        loadStatus()
      }
    } catch {
      setSyncError("Network error — could not reach the sync endpoint.")
    }
    setSyncing(false)
  }

  // Load status on first mount
  useState(() => { loadStatus() })

  const isConfigured = status?.isConfigured ?? false

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Connect GeniePro to external ATS platforms.</p>
      </div>

      {/* Ceipal card */}
      <div className="max-w-3xl space-y-5">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Ceipal logo placeholder */}
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                >
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">Ceipal ATS</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">v1 · api.ceipal.com</p>
                </div>
              </div>
              {statusLoading
                ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                : status !== null
                  ? <StatusBadge ok={isConfigured} label={isConfigured ? "Configured" : "Not configured"} />
                  : null
              }
            </div>
          </CardHeader>

          <CardContent className="space-y-5 pb-6">
            {/* Config checklist */}
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Configuration</p>
              {[
                { key: "CEIPAL_USERNAME",  label: "Ceipal email (CEIPAL_USERNAME)" },
                { key: "CEIPAL_PASSWORD",  label: "Ceipal password (CEIPAL_PASSWORD)" },
                { key: "CEIPAL_API_KEY",   label: "Ceipal API key (CEIPAL_API_KEY)" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  {isConfigured
                    ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
                  <span className={isConfigured ? "text-gray-700" : "text-gray-400"}>{label}</span>
                </div>
              ))}
              {!isConfigured && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Add <code className="font-mono bg-amber-100 px-1 rounded">CEIPAL_USERNAME</code>,{" "}
                    <code className="font-mono bg-amber-100 px-1 rounded">CEIPAL_PASSWORD</code>, and{" "}
                    <code className="font-mono bg-amber-100 px-1 rounded">CEIPAL_API_KEY</code> to{" "}
                    <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> then restart the dev server.
                  </p>
                </div>
              )}
            </div>

            {/* Sync stats */}
            {status && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{status.syncedJobCount}</p>
                    <p className="text-xs text-gray-400">Jobs synced</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-teal-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">—</p>
                    <p className="text-xs text-gray-400">Applicants</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sync options */}
            <div className="rounded-2xl border border-gray-100 p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Sync Jobs</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Posted in last N days</label>
                  <input
                    type="number"
                    value={postedAgoDays}
                    onChange={(e) => setPostedAgoDays(e.target.value)}
                    min="1"
                    max="365"
                    placeholder="e.g. 30"
                    className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Job status filter</label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="h-10 w-full px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  >
                    <option value="">All statuses</option>
                    <option value="Open">Open</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing || !isConfigured}
                className="flex items-center gap-2 h-11 px-6 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
              >
                {syncing
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Syncing…</>
                  : <><Download className="h-4 w-4" /> Sync Jobs from Ceipal</>}
              </button>
            </div>

            {/* Sync error */}
            {syncError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {syncError}
              </div>
            )}

            {/* Sync result */}
            {syncResult && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                  <p className="font-semibold text-green-800 text-sm">Sync complete</p>
                  <span className="ml-auto text-xs text-green-600">
                    {new Date(syncResult.syncedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Fetched",  value: syncResult.fetched,  color: "text-blue-700 bg-blue-50" },
                    { label: "Created",  value: syncResult.created,  color: "text-green-700 bg-green-100" },
                    { label: "Updated",  value: syncResult.updated,  color: "text-teal-700 bg-teal-50" },
                    { label: "Skipped",  value: syncResult.skipped,  color: "text-gray-500 bg-gray-100" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`rounded-xl p-2.5 text-center ${color}`}>
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-[10px] font-medium uppercase tracking-wide">{label}</p>
                    </div>
                  ))}
                </div>
                {syncResult.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer hover:underline">
                      {syncResult.errors.length} error{syncResult.errors.length > 1 ? "s" : ""}
                    </summary>
                    <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {syncResult.errors.map((e, i) => (
                        <li key={i} className="text-xs text-red-600 font-mono">{e}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            )}

            {/* Link to synced jobs */}
            <a
              href="/dashboard/admin/jobs"
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group"
            >
              <span className="text-sm text-gray-600 font-medium">View synced jobs in Job Management</span>
              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-700 transition-colors" />
            </a>

            {/* Refresh status button */}
            <button
              onClick={loadStatus}
              disabled={statusLoading}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${statusLoading ? "animate-spin" : ""}`} />
              Refresh status
            </button>
          </CardContent>
        </Card>

        {/* Coming soon integrations */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Coming Soon</p>
          <div className="space-y-2">
            {["Bullhorn ATS", "Greenhouse", "Lever", "Workday"].map((name) => (
              <div key={name} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white border border-gray-100">
                <span className="text-sm text-gray-500">{name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 uppercase tracking-wide">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
