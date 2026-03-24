"use client"

import { useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import {
  AlertCircle, Loader2, Eye, EyeOff, Stethoscope,
  Building2, FileText, Upload, X, CheckCircle2,
} from "lucide-react"
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel"


function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(1) + " MB"
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const jobId = searchParams.get("jobId") || ""
  const jobTitle = searchParams.get("jobTitle") || ""
  const jobCompany = searchParams.get("company") || ""
  const isJobApplication = Boolean(jobId)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CANDIDATE" as "CANDIDATE" | "RECRUITER",
    company: "",
    phone: "",
    yearsExperience: "",
    availability: "",
    coverLetter: "",
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeError, setResumeError] = useState("")
  const [showCoverLetter, setShowCoverLetter] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [emailExists, setEmailExists] = useState(false)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleRoleSwitch(r: "CANDIDATE" | "RECRUITER") {
    setFormData((prev) => ({ ...prev, role: r, company: "" }))
    setError("")
    setEmailExists(false)
  }

  function handleFileSelect(file: File) {
    setResumeError("")
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    if (!["pdf", "doc", "docx"].includes(ext)) {
      setResumeError("Only PDF, DOC, DOCX files are allowed.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File must be under 5MB.")
      return
    }
    setResumeFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setEmailExists(false)

    try {
      // 0. Upload resume if selected
      let uploadedResumeUrl = ""
      if (resumeFile && isJobApplication) {
        const fd = new FormData()
        fd.append("file", resumeFile)
        const uploadRes = await fetch("/api/upload/resume", { method: "POST", body: fd })
        if (!uploadRes.ok) {
          setError("Resume upload failed. Please try again.")
          setLoading(false)
          return
        }
        const uploadData = await uploadRes.json()
        uploadedResumeUrl = uploadData.url
      }

      // 1. Register account
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: isJobApplication ? "CANDIDATE" : formData.role,
          company: formData.company,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          setEmailExists(true)
        } else {
          setError(data.error || "Registration failed. Please try again.")
        }
        setLoading(false)
        return
      }

      // 2. Sign in
      const signInRes = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      if (signInRes?.error) {
        setError("Account created but sign-in failed. Please log in manually.")
        setLoading(false)
        return
      }

      // 3. Job application: update profile + submit application
      if (isJobApplication) {
        const profileData: Record<string, string | number> = {}
        if (formData.phone) profileData.phone = formData.phone
        if (uploadedResumeUrl) profileData.resumeUrl = uploadedResumeUrl
        if (formData.yearsExperience) profileData.yearsExperience = parseInt(formData.yearsExperience)
        if (formData.availability) profileData.availability = formData.availability

        if (Object.keys(profileData).length > 0) {
          await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profileData),
          })
        }

        await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId,
            coverLetter: showCoverLetter ? formData.coverLetter : null,
          }),
        })

        router.push(
          `/dashboard/candidate/applications?applied=true&jobId=${jobId}&jobTitle=${encodeURIComponent(jobTitle)}`
        )
        router.refresh()
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <AuthLeftPanel role={isJobApplication ? "CANDIDATE" : formData.role} variant="register" />

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 bg-white overflow-y-auto">
        <div className="max-w-sm mx-auto w-full">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Image
              src="/Shorter_logo.png"
              alt="GeniePro Healthcare"
              width={200}
              height={64}
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Job application banner */}
          {isJobApplication && (
            <div className="mb-6 p-4 rounded-2xl border border-blue-100 bg-blue-50">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Applying for:</p>
                  <p className="text-sm text-blue-700 font-semibold">{jobTitle}</p>
                  {jobCompany && <p className="text-xs text-gray-500 mt-0.5">{jobCompany}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Role toggle — hidden in job application mode */}
          {!isJobApplication && (
            <div className="flex p-1 rounded-full bg-gray-100 mb-8">
              {(["CANDIDATE", "RECRUITER"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSwitch(r)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    formData.role === r
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {r === "CANDIDATE" ? (
                    <Stethoscope className="h-4 w-4" />
                  ) : (
                    <Building2 className="h-4 w-4" />
                  )}
                  {r === "CANDIDATE" ? "Job Seeker" : "Recruiter"}
                </button>
              ))}
            </div>
          )}

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isJobApplication ? "Submit Your Application" : "Create your account"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isJobApplication
                ? "Fill in your details to apply. Takes less than a minute."
                : "Get started — it only takes a minute."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Generic error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email exists error */}
            {emailExists && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  An account with this email already exists.{" "}
                  <Link
                    href={`/auth/login${jobId ? `?jobId=${jobId}&jobTitle=${encodeURIComponent(jobTitle)}&company=${encodeURIComponent(jobCompany)}` : ""}`}
                    className="font-semibold underline hover:text-amber-900"
                  >
                    Sign in instead →
                  </Link>
                </span>
              </div>
            )}

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-medium">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => update("name", e.target.value)}
                required
                minLength={2}
                autoComplete="name"
                placeholder="Jane Smith"
                className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-medium">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => { update("email", e.target.value); setEmailExists(false) }}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Phone — job application only */}
            {isJobApplication && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  autoComplete="tel"
                  placeholder="+1 (555) 000-0000"
                  className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            )}

            {/* Position — pre-filled read-only */}
            {isJobApplication && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 font-medium">Position Applying For</label>
                <input
                  type="text"
                  value={jobTitle}
                  readOnly
                  className="h-12 w-full px-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-500 cursor-not-allowed"
                />
              </div>
            )}

            {/* Resume file upload — job application only */}
            {isJobApplication && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 font-medium">Resume / CV</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                />
                {!resumeFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-[#2EC4B6] bg-teal-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-[#2EC4B6] bg-teal-50 p-4 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#2EC4B6]/15 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#2EC4B6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{resumeFile.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(resumeFile.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                      className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {resumeError && (
                  <p className="text-xs text-red-500 mt-1">{resumeError}</p>
                )}
              </div>
            )}

            {/* Years of experience — job application only */}
            {isJobApplication && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 font-medium">Years of Experience</label>
                <input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => update("yearsExperience", e.target.value)}
                  min="0"
                  max="50"
                  placeholder="e.g. 3"
                  className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            )}

            {/* Availability — job application only */}
            {isJobApplication && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 font-medium">Availability / Start Date</label>
                <input
                  type="date"
                  value={formData.availability}
                  onChange={(e) => update("availability", e.target.value)}
                  className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-12 w-full px-4 pr-12 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Cover letter toggle — job application only */}
            {isJobApplication && (
              <div className="space-y-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                  <div
                    onClick={() => setShowCoverLetter(!showCoverLetter)}
                    className={`h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                      showCoverLetter
                        ? "border-[#2EC4B6] bg-[#2EC4B6]"
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}
                  >
                    {showCoverLetter && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    Add a cover letter{" "}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </span>
                </label>

                {showCoverLetter && (
                  <textarea
                    value={formData.coverLetter}
                    onChange={(e) => update("coverLetter", e.target.value)}
                    rows={4}
                    placeholder="Tell us why you're a great fit for this role..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                  />
                )}
              </div>
            )}

            {/* Company (recruiter only, non-job-application) */}
            {!isJobApplication && formData.role === "RECRUITER" && (
              <div className="space-y-1.5">
                <label className="text-sm text-gray-700 font-medium">Company / Facility Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => update("company", e.target.value)}
                  placeholder="General Hospital"
                  className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading
                ? isJobApplication ? "Submitting…" : "Creating account…"
                : isJobApplication ? "Submit Application" : "Create Account"}
            </button>
          </form>

          {/* Google sign-in — only for non-job-application flow */}
          {!isJobApplication && (
            <>
              <div className="mt-4 relative flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 shrink-0">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="mt-3 w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign up with Google
              </button>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </div>

          <p className="text-center text-sm text-gray-400 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
