"use client"

import { use } from "react"
import useSWR from "swr"
import Link from "next/link"
import {
  ArrowLeft, Mail, Phone, MapPin, Briefcase, FileText,
  ExternalLink, MessageSquare, Clock, CheckCircle2, Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials, formatRelativeTime } from "@/lib/utils"
import { SPECIALTIES } from "@/lib/constants"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  APPLIED:   { label: "Applied",    color: "text-yellow-700", bg: "bg-yellow-100" },
  SCREENING: { label: "Screening",  color: "text-blue-700",   bg: "bg-blue-100" },
  INTERVIEW: { label: "Interview",  color: "text-purple-700", bg: "bg-purple-100" },
  OFFER:     { label: "Offer",      color: "text-orange-700", bg: "bg-orange-100" },
  HIRED:     { label: "Hired",      color: "text-green-700",  bg: "bg-green-100" },
  REJECTED:  { label: "Rejected",   color: "text-red-600",    bg: "bg-red-100" },
  WITHDRAWN: { label: "Withdrawn",  color: "text-gray-500",   bg: "bg-gray-100" },
}

type CandidateProfile = {
  id: string
  specialty?: string | null
  subSpecialty?: string | null
  yearsExperience?: number | null
  availability?: string | null
  location?: string | null
  bio?: string | null
  skills?: string
  certifications?: string
  resumeUrl?: string | null
  linkedInUrl?: string | null
  licenseNumber?: string | null
  licenseState?: string | null
  phone?: string | null
  profession?: string | null
  licensedStates?: string
  preferredStates?: string
  compactLicense?: boolean
  user: { name: string; email: string; avatarUrl?: string | null }
  workHistory: Array<{
    id: string
    employer: string
    title: string
    startDate: string
    endDate?: string | null
    isCurrent: boolean
    description?: string | null
    location?: string | null
  }>
}

type Application = {
  id: string
  status: string
  appliedAt: string
  resumeUrlSnapshot?: string | null
  coverLetter?: string | null
  job: { id: string; title: string; specialty: string; location: string }
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: profile, isLoading: profileLoading } = useSWR<CandidateProfile>(
    `/api/candidates/${id}`,
    fetcher
  )
  const { data: applications, isLoading: appsLoading } = useSWR<Application[]>(
    `/api/applications`,
    fetcher
  )

  const candidateApps = applications?.filter((a) => a.job !== undefined) ?? []
  const specLabel = SPECIALTIES.find((s) => s.value === profile?.specialty)?.label
  const skills: string[] = profile?.skills ? JSON.parse(profile.skills) : []
  const certs: string[] = profile?.certifications ? JSON.parse(profile.certifications) : []
  const licensedStates: string[] = profile?.licensedStates ? JSON.parse(profile.licensedStates) : []

  if (profileLoading) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-screen-xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-60 rounded-2xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="p-6 lg:p-8 w-full max-w-screen-xl">
        <Link href="/dashboard/recruiter/candidates" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Candidates
        </Link>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-gray-500 font-semibold">Candidate not found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      {/* Back link */}
      <Link
        href="/dashboard/recruiter/candidates"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Candidates
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: profile card */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center gap-3">
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl"
              >
                {getInitials(profile.user.name)}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{profile.user.name}</h1>
                {profile.profession && <p className="text-sm text-gray-500">{profile.profession}</p>}
                {specLabel && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                    {specLabel}
                  </span>
                )}
              </div>

              <div className="w-full pt-3 border-t border-gray-100 space-y-3 text-left">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={profile.user.email} />
                {profile.phone && (
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={profile.phone} />
                )}
                {profile.location && (
                  <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={profile.location} />
                )}
                {profile.yearsExperience != null && (
                  <InfoRow icon={<Briefcase className="w-4 h-4" />} label="Experience" value={`${profile.yearsExperience} years`} />
                )}
                {profile.licenseNumber && (
                  <InfoRow icon={<CheckCircle2 className="w-4 h-4" />} label="License #" value={`${profile.licenseNumber}${profile.licenseState ? ` (${profile.licenseState})` : ""}`} />
                )}
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> View Resume
                  </a>
                )}
                {profile.linkedInUrl && (
                  <a
                    href={profile.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> LinkedIn
                  </a>
                )}
                <Link
                  href={`/dashboard/recruiter/messages?toId=${profile.user.name}`}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                >
                  <MessageSquare className="w-4 h-4" /> Send Message
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Licensed states */}
          {licensedStates.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-gray-400">Licensed States</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex flex-wrap gap-1.5">
                {licensedStates.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{s}</span>
                ))}
                {profile.compactLicense && (
                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">Compact License</span>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-gray-400">Skills</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{s}</span>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {certs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wide text-gray-400">Certifications</CardTitle>
              </CardHeader>
              <CardContent className="pb-4 flex flex-wrap gap-1.5">
                {certs.map((c) => (
                  <span key={c} className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">
                    <Star className="w-3 h-3 inline mr-1" />{c}
                  </span>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: bio, work history, applications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {profile.bio && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">About</CardTitle>
              </CardHeader>
              <CardContent className="pb-5">
                <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Work History */}
          {profile.workHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-900">Work History</CardTitle>
              </CardHeader>
              <CardContent className="pb-5 space-y-4">
                {profile.workHistory.map((w) => (
                  <div key={w.id} className="flex gap-3">
                    <div className="mt-1 h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{w.title}</p>
                      <p className="text-xs text-gray-500">{w.employer}{w.location ? ` · ${w.location}` : ""}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(w.startDate).getFullYear()} –{" "}
                        {w.isCurrent ? "Present" : w.endDate ? new Date(w.endDate).getFullYear() : ""}
                      </p>
                      {w.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">{w.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Applications to this recruiter's jobs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-900">Applications to Your Jobs</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              {appsLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : candidateApps.length === 0 ? (
                <div className="py-8 text-center">
                  <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">This candidate hasn&apos;t applied to any of your jobs yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidateApps.map((app) => {
                    const statusInfo = STATUS_STYLE[app.status] ?? { label: app.status, color: "text-gray-600", bg: "bg-gray-100" }
                    return (
                      <div key={app.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{app.job.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            <Clock className="w-3 h-3 inline mr-1" />Applied {formatRelativeTime(app.appliedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {app.resumeUrlSnapshot && (
                            <a
                              href={app.resumeUrlSnapshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <FileText className="w-3 h-3" /> Resume
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
