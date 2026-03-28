"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/landing/Navbar"

const REFERRAL_LINK = "https://genieprohealthcare.com/auth/register"

export default function ReferPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeEmail: email }),
      })
      setSent(true)
      setEmail("")
    } catch {
      setError("Failed to send invite. Please try again.")
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(REFERRAL_LINK)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#2EC4B6] text-sm font-bold uppercase tracking-widest mb-3">Referral Program</p>
          <h1 className="text-4xl font-black text-[#0F1E2E] mb-4">Know a Healthcare Professional?</h1>
          <p className="text-gray-500 mb-12">
            Refer a friend and help them find their next opportunity on GeniePro. It&apos;s free, fast, and rewarding.
          </p>

          {/* Email invite */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
            {sent ? (
              <div className="text-green-600 font-semibold py-4">
                ✅ Invitation sent! Your friend will receive an email shortly.
              </div>
            ) : (
              <form onSubmit={handleSend} className="flex gap-3 flex-col sm:flex-row">
                {error && <p className="text-red-500 text-sm text-left">{error}</p>}
                <input
                  type="email"
                  required
                  placeholder="friend@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 h-12 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
                />
                <button
                  type="submit"
                  className="h-12 px-6 rounded-full text-white font-bold text-sm hover:opacity-90 transition"
                  style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}
                >
                  Send Invite
                </button>
              </form>
            )}
          </div>

          {/* Copy link */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center gap-4">
            <input
              readOnly
              value={REFERRAL_LINK}
              className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-4 h-10 text-sm text-gray-500"
            />
            <button
              onClick={handleCopy}
              className="px-4 h-10 rounded-xl text-sm font-bold border border-gray-200 hover:border-[#2F80ED] hover:text-[#2F80ED] transition flex-shrink-0"
            >
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { emoji: "⚡", label: "Fast", desc: "Apply in 30 seconds" },
              { emoji: "🎁", label: "Free", desc: "No cost to refer" },
              { emoji: "🤝", label: "Rewarding", desc: "Help a colleague" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="text-2xl mb-2">{s.emoji}</div>
                <div className="font-bold text-[#0F1E2E]">{s.label}</div>
                <div className="text-xs text-gray-400 mt-1">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="text-sm text-white/40">© {new Date().getFullYear()} GeniePro Healthcare · Alpharetta, GA</span>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/jobs" className="hover:text-white/70 transition-colors">Find Jobs</Link>
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
