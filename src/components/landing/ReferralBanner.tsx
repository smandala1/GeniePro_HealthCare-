"use client"

import { useState } from "react"
import { Send, Copy, Check, Zap, DollarSign, Heart, Mail, Gift } from "lucide-react"

const STATS = [
  { icon: <Zap className="w-4 h-4 text-yellow-400" />,    label: "Fast",      sub: "They apply in under 30 seconds" },
  { icon: <DollarSign className="w-4 h-4 text-green-400" />, label: "Free",   sub: "No cost to refer or apply" },
  { icon: <Heart className="w-4 h-4 text-pink-400" />,    label: "Rewarding", sub: "Help a colleague find great work" },
]

const STEPS = [
  { num: "01", label: "Share Link",      desc: "Copy and share your unique referral link" },
  { num: "02", label: "Friend Applies",  desc: "They sign up and apply to open roles" },
  { num: "03", label: "You Earn",        desc: "Get rewarded when they get placed" },
]

export default function ReferralBanner() {
  const [email, setEmail]   = useState("")
  const [copied, setCopied] = useState(false)
  const [sent, setSent]     = useState(false)

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/register`
      : "https://genieprohealthcare.com/auth/register"

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

  return (
    <section className="py-10 px-4 sm:px-6">
      <div
        className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(145deg, #0A1628 0%, #111F35 40%, #0D2137 70%, #0A1628 100%)" }}
      >

        {/* ── Decorative background layer ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {/* Primary teal glow — top-right */}
          <div style={{
            position: "absolute", top: "-100px", right: "-80px",
            width: "500px", height: "500px",
            background: "radial-gradient(circle, rgba(46,196,182,0.22) 0%, transparent 62%)",
            filter: "blur(64px)",
          }} />
          {/* Blue glow — bottom-left */}
          <div style={{
            position: "absolute", bottom: "-80px", left: "-60px",
            width: "400px", height: "400px",
            background: "radial-gradient(circle, rgba(47,128,237,0.16) 0%, transparent 62%)",
            filter: "blur(56px)",
          }} />
          {/* Mid accent — subtle teal center-left */}
          <div style={{
            position: "absolute", top: "50%", left: "30%",
            transform: "translate(-50%, -50%)",
            width: "320px", height: "260px",
            background: "radial-gradient(ellipse, rgba(46,196,182,0.07) 0%, transparent 70%)",
            filter: "blur(40px)",
          }} />

          {/* Hex/network dot pattern */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.45 }}>
            <defs>
              <pattern id="ref-hex-net" x="0" y="0" width="64" height="56" patternUnits="userSpaceOnUse">
                {/* Hex vertices */}
                <circle cx="0"  cy="28" r="2.2" fill="#2EC4B6" opacity="0.55" />
                <circle cx="32" cy="0"  r="2.2" fill="#2EC4B6" opacity="0.55" />
                <circle cx="32" cy="56" r="2.2" fill="#2EC4B6" opacity="0.55" />
                <circle cx="64" cy="28" r="2.2" fill="#2EC4B6" opacity="0.55" />
                <circle cx="16" cy="14" r="1.4" fill="#56CCF2" opacity="0.35" />
                <circle cx="48" cy="14" r="1.4" fill="#56CCF2" opacity="0.35" />
                <circle cx="16" cy="42" r="1.4" fill="#56CCF2" opacity="0.35" />
                <circle cx="48" cy="42" r="1.4" fill="#56CCF2" opacity="0.35" />
                {/* Connecting lines */}
                <line x1="0"  y1="28" x2="16" y2="14" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="0"  y1="28" x2="16" y2="42" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="16" y1="14" x2="32" y2="0"  stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="16" y1="42" x2="32" y2="56" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="32" y1="0"  x2="48" y2="14" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="32" y1="56" x2="48" y2="42" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="48" y1="14" x2="64" y2="28" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="48" y1="42" x2="64" y2="28" stroke="#2EC4B6" strokeWidth="0.5" opacity="0.25" />
                <line x1="16" y1="14" x2="16" y2="42" stroke="#56CCF2" strokeWidth="0.4" opacity="0.18" />
                <line x1="48" y1="14" x2="48" y2="42" stroke="#56CCF2" strokeWidth="0.4" opacity="0.18" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ref-hex-net)" />
          </svg>

          {/* Top edge accent line */}
          <div style={{
            position: "absolute", top: 0, left: "8%", right: "8%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(46,196,182,0.55), transparent)",
          }} />
          {/* Bottom edge accent line */}
          <div style={{
            position: "absolute", bottom: 0, left: "20%", right: "20%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(47,128,237,0.35), transparent)",
          }} />
        </div>

        {/* ── Content ── */}
        <div className="relative p-8 sm:p-10 lg:p-14" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            {/* ── Left column ── */}
            <div className="space-y-8">

              {/* Reward badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                style={{
                  background: "rgba(46,196,182,0.12)",
                  border: "1px solid rgba(46,196,182,0.38)",
                }}
              >
                <Gift className="w-3.5 h-3.5" style={{ color: "#2EC4B6" }} />
                <span className="text-xs font-black tracking-widest uppercase" style={{ color: "#2EC4B6" }}>
                  Earn Rewards for Every Referral
                </span>
              </div>

              {/* Headline + sub */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
                  Know a Healthcare<br />Professional?
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                  Share GeniePro with your network. When they join and get placed,
                  everyone wins — faster careers, better facilities, real rewards.
                </p>
              </div>

              {/* ── Step indicator ── */}
              <div className="grid grid-cols-3 gap-4 sm:gap-2">
                {STEPS.map(({ num, label, desc }, i) => (
                  <div key={num} className="relative flex flex-col items-center sm:items-start">
                    {/* Connector line (not on last item) */}
                    {i < STEPS.length - 1 && (
                      <div
                        className="hidden sm:block absolute top-4 left-[calc(50%+18px)] right-0 h-px"
                        style={{ background: "linear-gradient(90deg, rgba(46,196,182,0.5), rgba(255,255,255,0.08))" }}
                        aria-hidden="true"
                      />
                    )}
                    {/* Step bubble */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 mb-3"
                      style={{
                        background: i === 0
                          ? "linear-gradient(135deg, rgba(46,196,182,0.35), rgba(47,128,237,0.25))"
                          : "rgba(255,255,255,0.07)",
                        border: i === 0 ? "1.5px solid #2EC4B6" : "1.5px solid rgba(255,255,255,0.15)",
                        color: i === 0 ? "#2EC4B6" : "rgba(255,255,255,0.45)",
                      }}
                    >
                      {num}
                    </div>
                    <p className="text-white font-bold text-xs sm:text-sm leading-tight mb-1 text-center sm:text-left">{label}</p>
                    <p className="text-gray-500 text-xs leading-snug text-center sm:text-left hidden sm:block">{desc}</p>
                  </div>
                ))}
              </div>

              {/* ── Email invite form ── */}
              <form onSubmit={handleSendInvite} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Email input with icon */}
                  <div className="relative flex-1">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your friend's email..."
                      className="w-full h-14 pl-11 pr-4 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.14)",
                      }}
                    />
                  </div>

                  {/* Send button */}
                  <button
                    type="submit"
                    className="h-14 px-7 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: "linear-gradient(135deg, #2F80ED, #2EC4B6)",
                      boxShadow: "0 4px 24px rgba(46,196,182,0.30)",
                    }}
                  >
                    <Send className="w-4 h-4" />
                    {sent ? "Invite Sent!" : "Send Invite"}
                  </button>
                </div>

                {/* Copy link button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-sm font-medium transition-all duration-200 hover:bg-white/10"
                  style={{
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {copied
                    ? <Check className="w-4 h-4 text-green-400" />
                    : <Copy className="w-4 h-4" />
                  }
                  {copied ? "Copied to clipboard!" : "Copy referral link instead"}
                </button>
              </form>
            </div>

            {/* ── Right column: stat cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
              {STATS.map(({ icon, label, sub }) => (
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
      </div>
    </section>
  )
}
