"use client"

import { useState, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Loader2, Eye, EyeOff, Stethoscope, Building2, ShieldCheck } from "lucide-react"
import { AuthLeftPanel } from "@/components/auth/AuthLeftPanel"

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.4 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.7 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.4 39.7 16.1 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.2 3.1-3.7 5.3-7 6.6l6.3 5.2C38.9 36 44 30.7 44 24c0-1.1-.1-2.3-.4-3.5z" />
    </svg>
  )
}

// Demo credentials per role
const DEMO = {
  CANDIDATE: { email: "candidate@demo.com", password: "Demo@1234" },
  RECRUITER: { email: "sarah@atlantichealth.com", password: "Recruiter@123" },
  ADMIN: { email: "admin@geniepro.com", password: "Admin@123" },
}

type Role = "CANDIDATE" | "RECRUITER" | "ADMIN"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [role, setRole] = useState<Role>("CANDIDATE")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleRoleSwitch(r: Role) {
    setRole(r)
    setEmail("")
    setPassword("")
    setError("")
  }

  function fillDemo() {
    setEmail(DEMO[role].email)
    setPassword(DEMO[role].password)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("Invalid email or password. Please try again.")
    } else {
      router.push(callbackUrl)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      <AuthLeftPanel role={role === "ADMIN" ? "RECRUITER" : role} variant="login" />

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12 bg-white overflow-y-auto">
        <div className="max-w-sm mx-auto w-full">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <img
              src="/Shorter_logo.png"
              alt="GeniePro Healthcare"
              className="h-16 w-auto"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Role toggle */}
          <div className="flex p-1 rounded-full bg-gray-100 mb-8">
            {(["CANDIDATE", "RECRUITER", "ADMIN"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSwitch(r)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  role === r
                    ? r === "ADMIN"
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-blue-500 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r === "CANDIDATE" ? (
                  <Stethoscope className="h-3.5 w-3.5" />
                ) : r === "RECRUITER" ? (
                  <Building2 className="h-3.5 w-3.5" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                {r === "CANDIDATE" ? "Job Seeker" : r === "RECRUITER" ? "Recruiter" : "Admin"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Login to start your session</h1>
            <p className="text-gray-500 text-sm">Welcome back! Please enter your details.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm text-gray-700 font-medium">Email / Phone</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-12 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700 font-medium">Password</label>
                <button
                  type="button"
                  className="text-xs text-blue-500 hover:underline font-medium"
                >
                  Reset Password
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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

            {/* Remember me */}
            <button
              type="button"
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2.5 text-sm text-gray-500 hover:text-gray-700"
            >
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  remember
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 bg-white"
                }`}
              >
                {remember && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Remember me for 30 days
            </button>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in…" : "Login"}
            </button>
          </form>

          {/* Google button */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="mt-3 w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Login with Google
          </button>

          {/* Demo mode notice */}
          <div
            className="mt-4 p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={fillDemo}
            title="Click to auto-fill demo credentials"
          >
            <span className="font-semibold text-gray-800">Demo mode.</span>{" "}
            Credentials are pre-filled — just click Login.
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-400 mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-blue-500 hover:underline font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400">
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
