"use client"

import { useState } from "react"
import { Send, Copy, Check, Zap, DollarSign, Heart } from "lucide-react"

export default function ReferralBanner() {
  const [email, setEmail] = useState("")
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/auth/register`
    : "https://geniepro.com/auth/register"

  function handleSendInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    const subject = encodeURIComponent("You're invited to GeniePro Healthcare!")
    const body = encodeURIComponent(
      `Hi!\n\nI wanted to share GeniePro Healthcare with you — it's a great platform for finding healthcare jobs.\n\nSign up here: ${referralLink}\n\nBest,\nA friend`
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`)
    setSent(true)
    setEmail("")
    setTimeout(() => setSent(false), 4000)
  }

  function handleCopy() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const stats = [
    { icon: <Zap className="w-4 h-4 text-yellow-400" />, label: "Fast", sub: "They apply in under 30 seconds" },
    { icon: <DollarSign className="w-4 h-4 text-green-400" />, label: "Free", sub: "No cost to refer or apply" },
    { icon: <Heart className="w-4 h-4 text-pink-400" />, label: "Rewarding", sub: "Help a colleague find great work" },
  ]

  return (
    <section className="py-10 px-6">
      <div
        className="max-w-7xl mx-auto rounded-3xl p-10"
        style={{ background: "linear-gradient(135deg, #1F2937, #0F1E2E)" }}
      >
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* ── Left ── */}
          <div className="space-y-5">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#2EC4B6] mb-3">
                Refer a Friend
              </p>
              <h2 className="text-2xl font-black text-white leading-snug">
                Know a Healthcare Professional?
              </h2>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-md">
                Refer a friend and help them find their next opportunity on GeniePro.
                Share your unique referral link.
              </p>
            </div>

            {/* Email invite form */}
            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your friend's email..."
                className="flex-1 h-11 px-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-full text-white text-sm font-semibold flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
              >
                <Send className="w-4 h-4" />
                {sent ? "Invite sent!" : "Send Invite"}
              </button>
            </form>

            {/* Copy link */}
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full border border-white/25 text-white/80 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy My Link"}
            </button>
          </div>

          {/* ── Right: stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
            {stats.map(({ icon, label, sub }) => (
              <div
                key={label}
                className="rounded-2xl p-4 border border-white/10"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {icon}
                  <span className="font-bold text-white text-sm">{label}</span>
                </div>
                <p className="text-gray-400 text-xs leading-snug">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
