"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import {
  User, Save, Loader2, CheckCircle2, MapPin,
  Briefcase, Award, Phone, Link as LinkIcon, AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { calculateProfileCompleteness } from "@/lib/utils"
import { SPECIALTIES, AVAILABILITY_OPTIONS, US_STATES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Profile = {
  specialty?: string | null
  subSpecialty?: string | null
  yearsExperience?: number | null
  skills?: string
  certifications?: string
  location?: string | null
  availability?: string | null
  desiredSalary?: string | null
  bio?: string | null
  linkedInUrl?: string | null
  licenseNumber?: string | null
  licenseState?: string | null
  phone?: string | null
}

export default function CandidateProfilePage() {
  const { data: session } = useSession()
  const { data: profile, isLoading } = useSWR<Profile>("/api/profile", fetcher)
  const [form, setForm] = useState<Record<string, string>>({})
  const [skillInput, setSkillInput] = useState("")
  const [certInput, setCertInput] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profile) {
      setForm({
        specialty:       profile.specialty ?? "",
        subSpecialty:    profile.subSpecialty ?? "",
        yearsExperience: String(profile.yearsExperience ?? ""),
        location:        profile.location ?? "",
        availability:    profile.availability ?? "",
        desiredSalary:   profile.desiredSalary ?? "",
        bio:             profile.bio ?? "",
        linkedInUrl:     profile.linkedInUrl ?? "",
        licenseNumber:   profile.licenseNumber ?? "",
        licenseState:    profile.licenseState ?? "",
        phone:           profile.phone ?? "",
      })
      setSkills(profile.skills ? JSON.parse(profile.skills) : [])
      setCerts(profile.certifications ? JSON.parse(profile.certifications) : [])
    }
  }, [profile])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills([...skills, s])
    setSkillInput("")
  }

  function removeSkill(s: string) {
    setSkills(skills.filter((x) => x !== s))
  }

  function addCert() {
    const c = certInput.trim()
    if (c && !certs.includes(c)) setCerts([...certs, c])
    setCertInput("")
  }

  function removeCert(c: string) {
    setCerts(certs.filter((x) => x !== c))
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : null,
        skills:          JSON.stringify(skills),
        certifications:  JSON.stringify(certs),
      }),
    })
    if (res.ok) {
      await mutate("/api/profile")
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const d = await res.json()
      setError(d.error || "Failed to save profile")
    }
    setSaving(false)
  }

  const completeness = profile ? calculateProfileCompleteness({ ...profile, skills: JSON.stringify(skills) }) : 0

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-screen-xl">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Keep your profile complete to attract recruiters.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Profile"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile completeness sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Profile Strength</p>
                <span className="text-sm font-bold text-primary-600">{completeness}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {completeness < 50 ? "Add more details to improve visibility" :
                 completeness < 80 ? "Looking good! Almost there" :
                 "Great profile! Recruiters can find you easily"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
              </div>
              {form.specialty && (
                <Badge variant="default" className="mb-2">{SPECIALTIES.find(s => s.value === form.specialty)?.label}</Badge>
              )}
              {form.location && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                  <MapPin className="h-3.5 w-3.5" /> {form.location}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary-500" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Specialty">
                  <select value={form.specialty} onChange={(e) => update("specialty", e.target.value)} className={inputCls}>
                    <option value="">Select specialty</option>
                    {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Years of Experience">
                  <input type="number" min={0} max={50} value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} placeholder="e.g. 5" className={inputCls} />
                </Field>
              </div>
              <Field label="Sub-Specialty">
                <input type="text" value={form.subSpecialty} onChange={(e) => update("subSpecialty", e.target.value)} placeholder="e.g. Pediatric ICU, Oncology" className={inputCls} />
              </Field>
              <Field label="Bio">
                <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} placeholder="Tell recruiters about yourself, your experience, and what you're looking for…" className={`${inputCls} h-auto`} />
              </Field>
            </CardContent>
          </Card>

          {/* Location & availability */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500" /> Location & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Location">
                  <input type="text" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="City, State" className={inputCls} />
                </Field>
                <Field label="Availability">
                  <select value={form.availability} onChange={(e) => update("availability", e.target.value)} className={inputCls}>
                    <option value="">Select availability</option>
                    {AVAILABILITY_OPTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Desired Salary">
                <input type="text" value={form.desiredSalary} onChange={(e) => update("desiredSalary", e.target.value)} placeholder="e.g. $80,000/yr or $45/hr" className={inputCls} />
              </Field>
            </CardContent>
          </Card>

          {/* Skills & Certifications */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-primary-500" /> Skills & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Add a skill and press Enter"
                    className={inputCls}
                  />
                  <button onClick={addSkill} className="h-10 px-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium transition-colors shrink-0">Add</button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <button key={s} onClick={() => removeSkill(s)} className="text-[12px] px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                        {s} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">Certifications</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCert())}
                    placeholder="Add a certification and press Enter"
                    className={inputCls}
                  />
                  <button onClick={addCert} className="h-10 px-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm font-medium transition-colors shrink-0">Add</button>
                </div>
                {certs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {certs.map((c) => (
                      <button key={c} onClick={() => removeCert(c)} className="text-[12px] px-2.5 py-1 rounded-full bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                        {c} ×
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact & License */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary-500" /> Contact & License
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
                <Field label="LinkedIn URL">
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="url" value={form.linkedInUrl} onChange={(e) => update("linkedInUrl", e.target.value)} placeholder="linkedin.com/in/…" className={`${inputCls} pl-9`} />
                  </div>
                </Field>
                <Field label="License Number">
                  <input type="text" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} placeholder="RN-123456" className={inputCls} />
                </Field>
                <Field label="License State">
                  <select value={form.licenseState} onChange={(e) => update("licenseState", e.target.value)} className={inputCls}>
                    <option value="">Select state</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </CardContent>
          </Card>
        </div>
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
