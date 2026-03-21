"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import useSWR from "swr"
import { Copy, Check, Send, Users, Clock, UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Referral = {
  id: string
  refereeEmail: string
  status: string
  sentAt: string
  joinedAt?: string | null
}

export default function ReferralsPage() {
  const { data: session } = useSession()
  const { data: referrals, isLoading, mutate } = useSWR<Referral[]>("/api/referrals/my", fetcher)

  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState("")
  const [sendSuccess, setSendSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/auth/register?ref=${session?.user?.id ?? ""}`
    : ""

  function handleCopy() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true); setSendError(""); setSendSuccess(false)
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refereeEmail: email }),
      })
      if (res.ok) {
        // Also open mailto
        const subject = encodeURIComponent("You're invited to GeniePro Healthcare!")
        const body = encodeURIComponent(
          `Hi!\n\nI wanted to invite you to join GeniePro Healthcare — a great platform for finding healthcare jobs.\n\nSign up here: ${referralLink}\n\nBest,\n${session?.user?.name ?? "A friend"}`
        )
        window.open(`mailto:${email}?subject=${subject}&body=${body}`)
        setSendSuccess(true)
        setEmail("")
        mutate()
      } else {
        const d = await res.json()
        setSendError(d.error || "Failed to send referral.")
      }
    } catch {
      setSendError("Something went wrong.")
    }
    setSending(false)
  }

  const joined  = referrals?.filter((r) => r.status === "JOINED").length ?? 0
  const pending = referrals?.filter((r) => r.status === "PENDING").length ?? 0

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Referrals</h1>
        <p className="text-sm text-gray-500 mt-1">
          Share GeniePro with colleagues and help them find their next role.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Sent</p>
              {isLoading ? <Skeleton className="h-7 w-10 mt-1" /> : <p className="text-2xl font-bold mt-1 text-gray-900">{referrals?.length ?? 0}</p>}
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Joined</p>
              {isLoading ? <Skeleton className="h-7 w-10 mt-1" /> : <p className="text-2xl font-bold mt-1 text-gray-900">{joined}</p>}
            </div>
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Pending</p>
              {isLoading ? <Skeleton className="h-7 w-10 mt-1" /> : <p className="text-2xl font-bold mt-1 text-gray-900">{pending}</p>}
            </div>
            <div className="h-10 w-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Referral link + invite form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pb-6">
            {/* Copy link */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Share this link with colleagues:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={referralLink}
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 focus:outline-none truncate"
                />
                <button
                  onClick={handleCopy}
                  className="h-10 px-4 rounded-xl border border-gray-200 text-sm font-medium flex items-center gap-1.5 text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Send by email */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Or send an invitation by email:</p>
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSendError(""); setSendSuccess(false) }}
                  placeholder="colleague@hospital.com"
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="h-10 px-5 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 shrink-0 transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
              {sendError && <p className="text-xs text-red-500 mt-2">{sendError}</p>}
              {sendSuccess && <p className="text-xs text-green-600 mt-2">Invitation sent!</p>}
            </div>
          </CardContent>
        </Card>

        {/* Referrals table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sent Invitations</CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            ) : !referrals || referrals.length === 0 ? (
              <div className="py-10 text-center">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No referrals sent yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{r.refereeEmail}</p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(r.sentAt)}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                      r.status === "JOINED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {r.status === "JOINED" ? "Joined" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
