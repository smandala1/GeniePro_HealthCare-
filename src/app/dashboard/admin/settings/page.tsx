"use client"

import { useState } from "react"
import {
  Settings, Globe, Mail, Database,
  Loader2, CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSettingsPage() {
  const [platform, setPlatform] = useState({
    siteName:       "GeniePro Healthcare",
    siteTagline:    "Connecting Healthcare Professionals",
    supportEmail:   "support@genieprohealthcare.com",
    allowNewSignups: true,
    requireApproval: false,
    maintenanceMode: false,
  })

  const [email, setEmail] = useState({
    smtpHost:  "",
    smtpPort:  "587",
    smtpUser:  "",
    smtpPass:  "",
    fromName:  "GeniePro Healthcare",
    fromEmail: "no-reply@genieprohealthcare.com",
  })

  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved]   = useState<string | null>(null)

  async function save(section: string) {
    setSaving(section)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(null)
    setSaved(section)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global platform behavior and integrations.</p>
      </div>

      <div className="space-y-5">
        {/* Platform settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary-500" /> Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Site Name">
                <input type="text" value={platform.siteName} onChange={(e) => setPlatform((p) => ({ ...p, siteName: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Tagline">
                <input type="text" value={platform.siteTagline} onChange={(e) => setPlatform((p) => ({ ...p, siteTagline: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Support Email">
              <input type="email" value={platform.supportEmail} onChange={(e) => setPlatform((p) => ({ ...p, supportEmail: e.target.value }))} className={inputCls} />
            </Field>
            <div className="space-y-3 pt-2">
              {[
                { key: "allowNewSignups" as const, label: "Allow new user registrations" },
                { key: "requireApproval" as const, label: "Require admin approval for new accounts" },
                { key: "maintenanceMode" as const, label: "Maintenance mode (disables public access)" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">{label}</span>
                  <button
                    onClick={() => setPlatform((p) => ({ ...p, [key]: !p[key] }))}
                    className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${platform[key] ? "bg-primary-500" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${platform[key] ? "translate-x-4" : "translate-x-0"}`} />
                  </button>
                </label>
              ))}
            </div>
            <button
              onClick={() => save("platform")}
              disabled={saving === "platform"}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {saving === "platform" ? <Loader2 className="h-4 w-4 animate-spin" /> : saved === "platform" ? <CheckCircle2 className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              {saving === "platform" ? "Saving…" : saved === "platform" ? "Saved!" : "Save Platform Settings"}
            </button>
          </CardContent>
        </Card>

        {/* Email settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary-500" /> Email / SMTP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="SMTP Host">
                <input type="text" value={email.smtpHost} onChange={(e) => setEmail((p) => ({ ...p, smtpHost: e.target.value }))} placeholder="smtp.sendgrid.net" className={inputCls} />
              </Field>
              <Field label="SMTP Port">
                <input type="text" value={email.smtpPort} onChange={(e) => setEmail((p) => ({ ...p, smtpPort: e.target.value }))} placeholder="587" className={inputCls} />
              </Field>
              <Field label="SMTP Username">
                <input type="text" value={email.smtpUser} onChange={(e) => setEmail((p) => ({ ...p, smtpUser: e.target.value }))} placeholder="apikey" className={inputCls} />
              </Field>
              <Field label="SMTP Password">
                <input type="password" value={email.smtpPass} onChange={(e) => setEmail((p) => ({ ...p, smtpPass: e.target.value }))} placeholder="••••••••" className={inputCls} />
              </Field>
              <Field label="From Name">
                <input type="text" value={email.fromName} onChange={(e) => setEmail((p) => ({ ...p, fromName: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="From Email">
                <input type="email" value={email.fromEmail} onChange={(e) => setEmail((p) => ({ ...p, fromEmail: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <button
              onClick={() => save("email")}
              disabled={saving === "email"}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              {saving === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : saved === "email" ? <CheckCircle2 className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
              {saving === "email" ? "Saving…" : saved === "email" ? "Saved!" : "Save Email Settings"}
            </button>
          </CardContent>
        </Card>

        {/* System info */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-primary-500" /> System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "Version",   value: "1.0.0" },
              { label: "Database",  value: "SQLite (dev.db)" },
              { label: "Framework", value: "Next.js 14 (App Router)" },
              { label: "Auth",      value: "NextAuth v4" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-medium text-gray-700 font-mono">{value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
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
