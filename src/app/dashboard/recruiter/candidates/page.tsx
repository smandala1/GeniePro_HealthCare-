"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  Users, Search, MapPin, MessageSquare, ArrowRight, ChevronLeft, ChevronRight,
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/utils"
import { SPECIALTIES } from "@/lib/constants"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ─── Style Maps ──────────────────────────────────────────────────────────────

const AVATAR_GRADIENT: Record<string, string> = {
  NURSING:      "from-blue-400 to-blue-600",
  ALLIED_HEALTH:"from-teal-400 to-teal-600",
  NONCLINICAL:  "from-purple-400 to-purple-600",
  PHARMA:       "from-green-400 to-green-600",
}

const SPEC_BADGE: Record<string, string> = {
  NURSING:      "bg-blue-50 text-blue-700",
  ALLIED_HEALTH:"bg-teal-50 text-teal-700",
  NONCLINICAL:  "bg-purple-50 text-purple-700",
  PHARMA:       "bg-green-50 text-green-700",
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Candidate = {
  id: string
  specialty?: string | null
  yearsExperience?: number | null
  availability?: string | null
  location?: string | null
  bio?: string | null
  skills?: string
  user: { name: string; email: string; avatarUrl?: string | null; isActive: boolean }
  _count: { applications: number }
}

// ─── Candidate Card ───────────────────────────────────────────────────────────

function CandidateCard({ c }: { c: Candidate }) {
  const specLabel   = SPECIALTIES.find((s) => s.value === c.specialty)?.label
  const avatarGrad  = AVATAR_GRADIENT[c.specialty ?? ""] ?? "from-gray-400 to-gray-500"
  const badgeClass  = SPEC_BADGE[c.specialty ?? ""] ?? "bg-gray-100 text-gray-600"
  const skills: string[] = c.skills ? (JSON.parse(c.skills) as string[]).slice(0, 3) : []
  const availLabel  = c.availability?.replace(/_/g, " ") ?? null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 flex flex-col gap-4">

      {/* Top row: avatar + name/email + specialty badge */}
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center shrink-0`}
        >
          <span className="text-white font-bold text-sm">{getInitials(c.user.name)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-base leading-snug truncate">{c.user.name}</p>
          <p className="text-sm text-gray-400 truncate">{c.user.email}</p>
        </div>

        {specLabel && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${badgeClass}`}>
            {specLabel}
          </span>
        )}
      </div>

      {/* Tags row: experience + availability + skills */}
      {(c.yearsExperience || availLabel || skills.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {c.yearsExperience && (
            <span className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs">
              {c.yearsExperience}yr exp
            </span>
          )}
          {availLabel && (
            <span className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs">
              {availLabel}
            </span>
          )}
          {skills.map((s) => (
            <span key={s} className="bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 text-xs">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {c.location && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          {c.location}
        </div>
      )}

      {/* Bio */}
      {c.bio && (
        <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">{c.bio}</p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/dashboard/recruiter/messages?toId=${c.user.name}`}
          className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <MessageSquare className="w-4 h-4" /> Message
        </Link>
        <Link
          href={`/dashboard/recruiter/candidates/${c.id}`}
          className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
        >
          View Profile <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecruiterCandidatesPage() {
  const [specialty, setSpecialty] = useState("")
  const [keyword, setKeyword]     = useState("")
  const [search, setSearch]       = useState("")
  const [page, setPage]           = useState(1)

  const params = new URLSearchParams({ page: String(page) })
  if (specialty) params.set("specialty", specialty)
  if (search)    params.set("keyword", search)

  const { data, isLoading } = useSWR(`/api/candidates?${params}`, fetcher)
  const candidates: Candidate[] = data?.candidates ?? []
  const totalPages: number      = data?.totalPages ?? 1

  function handleSearch() { setSearch(keyword); setPage(1) }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Browse Candidates</h1>
        <p className="text-sm text-gray-500 mt-1">
          {isLoading ? "Loading…" : `${data?.total ?? 0} healthcare professionals registered`}
        </p>
      </div>

      {/* Search bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or keywords…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-12 w-full pl-11 pr-4 rounded-2xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            />
          </div>
          <select
            value={specialty}
            onChange={(e) => { setSpecialty(e.target.value); setPage(1) }}
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">All Specialties</option>
            {SPECIALTIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button
            onClick={handleSearch}
            className="h-12 px-6 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 text-center">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No candidates found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {candidates.map((c) => <CandidateCard key={c.id} c={c} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-gray-500 px-2">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
