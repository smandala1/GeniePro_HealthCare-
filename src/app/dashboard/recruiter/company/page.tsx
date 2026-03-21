"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import {
  Building2, Save, Loader2, CheckCircle2, Globe,
  Phone, MapPin, AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { US_STATES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type RecruiterProfile = {
  company?: string
  position?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
}

export default function RecruiterCompanyPage() {
  const { data: profile, isLoading } = useSWR<RecruiterProfile>("/api/recruiter-profile", fetcher)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profile) {
      setForm({
        company:     profile.company ?? "",
        position:    profile.position ?? "",
        phone:       profile.phone ?? "",
        website:     profile.website ?? "",
        description: profile.description ?? "",
        address:     profile.address ?? "",
        city:        profile.city ?? "",
        state:       profile.state ?? "",
      })
    }
  }, [profile])

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    const res = await fetch("/api/recruiter-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await mutate("/api/recruiter-profile")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const d = await res.json()
      setError(d.error || "Failed to save")
    }
    setSaving(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-2xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-2xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Candidates see this when viewing your job listings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Company basics */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary-500" /> Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Company / Facility Name">
              <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="General Hospital" className={inputCls} />
            </Field>
            <Field label="Your Position / Title">
              <input type="text" value={form.position} onChange={(e) => update("position", e.target.value)} placeholder="Talent Acquisition Manager" className={inputCls} />
            </Field>
            <Field label="Company Description">
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                rows={4}
                placeholder="Tell candidates about your facility, culture, and mission…"
                className={`${inputCls} h-auto`}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary-500" /> Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className={`${inputCls} pl-9`} />
                </div>
              </Field>
              <Field label="Website">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="url" value={form.website} onChange={(e) => update("website", e.target.value)} placeholder="https://yourfacility.com" className={`${inputCls} pl-9`} />
                </div>
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-500" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Street Address">
              <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Medical Center Drive" className={inputCls} />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="City">
                <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Atlanta" className={inputCls} />
              </Field>
              <Field label="State">
                <select value={form.state} onChange={(e) => update("state", e.target.value)} className={inputCls}>
                  <option value="">Select state</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
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
