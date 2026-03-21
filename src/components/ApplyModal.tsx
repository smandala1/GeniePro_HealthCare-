"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import {
  X, Upload, CheckCircle2, Loader2, Eye, EyeOff, AlertCircle,
} from "lucide-react"
import { SPECIALTIES } from "@/lib/constants"
import type { ModalJob } from "@/hooks/useApplyModal"

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  job: ModalJob
  onClose: () => void
  onSuccess: (jobTitle: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFileSize(b: number) {
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + " KB"
  return (b / (1024 * 1024)).toFixed(1) + " MB"
}

const ALLOWED_RESUME = [".pdf", ".doc", ".docx"]
const ALLOWED_CERTS  = [".pdf", ".jpg", ".jpeg", ".png"]
const MAX_CERTS = 5

function FileChip({ name, size, onRemove }: { name: string; size?: number; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-[#2EC4B6]/30 rounded-xl text-xs">
      <span className="text-gray-700 truncate max-w-[160px]">{name}</span>
      {size !== undefined && <span className="text-gray-400 shrink-0">{formatFileSize(size)}</span>}
      <button type="button" onClick={onRemove} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function UploadZone({
  file, onFile, label, subtext, accept, error,
}: {
  file: File | null
  onFile: (f: File) => void
  label: string
  subtext: string
  accept: string
  error?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function validate(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
    const allowed = accept.split(",").map((s) => s.trim().replace(".", ""))
    if (!allowed.includes(ext)) return false
    if (f.size > 5 * 1024 * 1024) return false
    return true
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && validate(f)) onFile(f)
  }

  return (
    <div>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f && validate(f)) onFile(f) }} />
      {!file ? (
        <div
          onClick={() => ref.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-5 text-center cursor-pointer transition-all duration-200 ${
            dragging ? "border-[#2EC4B6] bg-teal-50" : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
          }`}
        >
          <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-[#2EC4B6] bg-teal-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#2EC4B6] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <button type="button" onClick={() => { onFile(null as unknown as File); if (ref.current) ref.current.value = "" }}
            className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function ApplyModal({ job, onClose, onSuccess }: Props) {
  const { data: session } = useSession()
  const isLoggedIn = !!session

  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailExists, setEmailExists] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [certFiles, setCertFiles] = useState<File[]>([])
  const certInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: "",
    specialty: job.specialty ?? "",
    yearsExperience: "",
    availability: "",
    coverLetter: "",
    password: "",
  })

  useEffect(() => { setTimeout(() => setMounted(true), 10) }, [])

  // Sync session data when it loads
  useEffect(() => {
    if (session) {
      setForm((p) => ({
        ...p,
        name: session.user?.name ?? p.name,
        email: session.user?.email ?? p.email,
      }))
    }
  }, [session])

  function update(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })); setError(""); setEmailExists(false) }

  function addCerts(files: FileList | null) {
    if (!files) return
    const allowed = Array.from(files).filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() ?? ""
      return ALLOWED_CERTS.map((e) => e.replace(".", "")).includes(ext) && f.size <= 5 * 1024 * 1024
    })
    setCertFiles((prev) => [...prev, ...allowed].slice(0, MAX_CERTS))
  }

  function removeCert(i: number) { setCertFiles((p) => p.filter((_, idx) => idx !== i)) }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData(); fd.append("file", file)
    const res = await fetch("/api/upload/resume", { method: "POST", body: fd })
    if (!res.ok) throw new Error("Upload failed")
    return (await res.json()).url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isLoggedIn && !form.name.trim()) { setError("Please enter your full name."); return }
    if (!isLoggedIn && !form.email.trim()) { setError("Please enter your email."); return }
    if (!isLoggedIn && form.password.length < 8) { setError("Password must be at least 8 characters."); return }
    setLoading(true); setError(""); setEmailExists(false)

    try {
      // 1. Upload resume
      let resumeUrl = ""
      if (resumeFile) {
        try { resumeUrl = await uploadFile(resumeFile) }
        catch { setError("Resume upload failed. Please try again."); setLoading(false); return }
      }

      // 2. Upload certificates
      const certUrls: string[] = []
      for (const f of certFiles) {
        try { certUrls.push(await uploadFile(f)) } catch { /* skip failed certs */ }
      }

      if (!isLoggedIn) {
        // 3a. Register new user
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: "CANDIDATE" }),
        })
        const regData = await regRes.json()
        if (!regRes.ok) {
          if (regRes.status === 409) { setEmailExists(true); setLoading(false); return }
          setError(regData.error || "Registration failed."); setLoading(false); return
        }

        // 3b. Sign in
        const signInRes = await signIn("credentials", { email: form.email, password: form.password, redirect: false })
        if (signInRes?.error) { setError("Account created but sign-in failed. Please try logging in."); setLoading(false); return }
      }

      // 4. Update profile
      const profileData: Record<string, string | number | string[]> = {}
      if (form.phone) profileData.phone = form.phone
      if (resumeUrl) profileData.resumeUrl = resumeUrl
      if (form.yearsExperience) profileData.yearsExperience = parseInt(form.yearsExperience)
      if (form.availability) profileData.availability = form.availability
      if (form.specialty) profileData.specialty = form.specialty
      if (Object.keys(profileData).length > 0) {
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileData) })
      }

      // 5. Submit application
      const appRes = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, coverLetter: showCoverLetter ? form.coverLetter : null }),
      })
      if (!appRes.ok && appRes.status !== 409) {
        const d = await appRes.json()
        setError(d.error || "Failed to submit application."); setLoading(false); return
      }

      // 6. Success
      onSuccess(job.title)
      onClose()
    } catch {
      setError("Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ opacity: mounted ? 1 : 0, transition: "opacity 300ms ease" }}
        onClick={onClose}
      />

      {/* Modal card */}
      <div
        className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 300ms ease, transform 300ms ease",
        }}
      >
        {/* ── Sticky header ── */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "#2EC4B6" }}>
              Applying for
            </p>
            <h2 className="font-bold text-gray-900 text-lg leading-tight">{job.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all shrink-0 mt-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <form id="apply-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-7">

            {/* Logged-in banner */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50 border border-[#2EC4B6]/20">
                <CheckCircle2 className="w-5 h-5 text-[#2EC4B6] shrink-0" />
                <p className="text-sm text-gray-700">
                  Applying as <span className="font-semibold">{session.user?.name}</span>
                </p>
              </div>
            )}

            {/* Errors */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            {emailExists && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  An account with this email already exists.{" "}
                  <a href="/auth/login" className="font-semibold underline">Sign in instead →</a>
                </span>
              </div>
            )}

            {/* ── Section 1: Personal info (hidden if logged in) ── */}
            {!isLoggedIn && (
              <section>
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Personal Info</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="Jane Smith"
                      className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required placeholder="you@example.com"
                      className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000"
                      className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                </div>
              </section>
            )}

            {/* ── Section 2: Application details ── */}
            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Application Details</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Position Applying For</label>
                  <input type="text" value={job.title} readOnly
                    className="h-11 w-full px-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 cursor-not-allowed" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Specialty</label>
                    <select value={form.specialty} onChange={(e) => update("specialty", e.target.value)}
                      className="h-11 w-full px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all">
                      <option value="">Select specialty</option>
                      {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Years of Experience</label>
                    <input type="number" value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)}
                      min="0" max="50" placeholder="e.g. 3"
                      className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Availability / Start Date</label>
                  <input type="date" value={form.availability} onChange={(e) => update("availability", e.target.value)}
                    className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all" />
                </div>
              </div>
            </section>

            {/* ── Section 3: Documents ── */}
            <section>
              <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-1">Upload Documents</h3>
              <p className="text-xs text-gray-400 mb-4">Upload your resume and any supporting certificates.</p>
              <div className="space-y-4">
                <UploadZone
                  file={resumeFile}
                  onFile={setResumeFile}
                  label="Click to upload Resume / CV"
                  subtext="PDF, DOC, DOCX up to 5MB"
                  accept=".pdf,.doc,.docx"
                />

                {/* Certificates — multiple */}
                <div>
                  <input
                    ref={certInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={(e) => addCerts(e.target.files)}
                  />
                  {certFiles.length < MAX_CERTS ? (
                    <div
                      onClick={() => certInputRef.current?.click()}
                      className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-center cursor-pointer hover:border-gray-300 hover:bg-gray-100 transition-all duration-200"
                    >
                      <Upload className="w-5 h-5 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-600">Upload Certificates <span className="text-gray-400 font-normal">(optional)</span></p>
                      <p className="text-xs text-gray-400 mt-0.5">Nursing license, BLS, ACLS, specialty certs · PDF, JPG, PNG up to 5MB each · Max {MAX_CERTS}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-2">Maximum {MAX_CERTS} certificates reached.</p>
                  )}
                  {certFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {certFiles.map((f, i) => (
                        <FileChip key={i} name={f.name} size={f.size} onRemove={() => removeCert(i)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ── Section 4: Cover letter (collapsible) ── */}
            <section>
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div
                  onClick={() => setShowCoverLetter(!showCoverLetter)}
                  className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                    showCoverLetter ? "border-[#2EC4B6] bg-[#2EC4B6]" : "border-gray-300 bg-white group-hover:border-gray-400"
                  }`}
                >
                  {showCoverLetter && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Add a cover letter <span className="text-gray-400 font-normal">(optional)</span>
                </span>
              </label>
              {showCoverLetter && (
                <textarea
                  value={form.coverLetter}
                  onChange={(e) => update("coverLetter", e.target.value)}
                  rows={4}
                  placeholder="Tell us why you're a great fit for this role..."
                  className="mt-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                />
              )}
            </section>

            {/* ── Section 5: Password (not logged in only) ── */}
            {!isLoggedIn && (
              <section>
                <h3 className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Create Your Account Password</h3>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      className="h-11 w-full px-4 pr-12 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </section>
            )}
          </form>
        </div>

        {/* ── Sticky footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white shrink-0 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <a href="/auth/login" className="text-blue-500 hover:underline font-medium">Sign in</a>
          </p>
          <button
            type="submit"
            form="apply-form"
            disabled={loading}
            className="flex items-center justify-center gap-2 h-11 px-8 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60 shrink-0"
            style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  )
}
