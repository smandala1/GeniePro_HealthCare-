import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { MapPin, Clock, Briefcase, DollarSign, Users, Star, ArrowLeft, Share2, Send } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { isCustomJobsConfigured, fetchCustomCeipalJobById } from "@/lib/ceipal"
import { CopyLinkButton } from "@/components/ui/CopyLinkButton"

const BASE_URL = process.env.NEXTAUTH_URL || "https://genieprohealthcare.com"

// ── Data fetching ──────────────────────────────────────────────────────────────

async function getJob(id: string) {
  // Try DB first
  const dbJob = await prisma.job.findUnique({
    where: { id },
    include: {
      recruiterProfile: { select: { company: true, logoUrl: true, city: true, state: true, description: true } },
      _count: { select: { applications: true } },
    },
  }).catch(() => null)

  if (dbJob) return { ...dbJob, isCeipal: false, applyUrl: null as string | null }

  // Fall back to Ceipal
  if (isCustomJobsConfigured()) {
    const ceipalJob = await fetchCustomCeipalJobById(id).catch(() => null)
    if (ceipalJob) return ceipalJob
  }

  return null
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const job = await getJob(id)
  if (!job) return { title: "Job Not Found | GeniePro Healthcare" }

  const description = (job.description ?? "").replace(/<[^>]*>/g, "").slice(0, 160)
  const title = `${job.title} — ${job.recruiterProfile.company} | GeniePro Healthcare`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/jobs/${id}`,
      siteName: "GeniePro Healthcare",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    alternates: { canonical: `${BASE_URL}/jobs/${id}` },
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract",
  PER_DIEM: "Per Diem", TRAVEL: "Travel", TEMP: "Temp",
}

const SPEC_STYLE: Record<string, string> = {
  NURSING: "bg-blue-50 text-blue-700",
  ALLIED_HEALTH: "bg-teal-50 text-teal-700",
  NONCLINICAL: "bg-purple-50 text-purple-700",
  PHARMA: "bg-green-50 text-green-700",
}

function formatSal(min?: number | null, max?: number | null) {
  if (!min && !max) return null
  const k = (n: number) => `$${Math.round(n / 1000)}k`
  if (min && max) return `${k(min)} – ${k(max)}`
  return min ? `From ${k(min)}` : `Up to ${k(max!)}`
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return null
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return "Today"
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PublicJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await getJob(id)
  if (!job) notFound()

  const specStyle = SPEC_STYLE[job.specialty] ?? "bg-gray-100 text-gray-600"
  const salary = ("payDisplay" in job && job.payDisplay)
    ? job.payDisplay
    : formatSal(job.salaryMin, job.salaryMax)
  const location = [job.recruiterProfile.city, job.recruiterProfile.state].filter(Boolean).join(", ") || job.location
  const descLines = (job.description ?? "").split("\n").filter(Boolean)
  const reqLines  = (job.requirements ?? "").split("\n").filter(Boolean)
  const benLines  = ("benefits" in job && job.benefits) ? (job.benefits as string).split("\n").filter(Boolean) : []
  const posted = timeAgo(job.postedAt instanceof Date ? job.postedAt.toISOString() : job.postedAt)
  const applyUrl = ("applyUrl" in job ? job.applyUrl : null) as string | null
  const applicationCount = job._count?.applications ?? 0

  const jobUrl = `${BASE_URL}/jobs/${id}`
  const shareText = encodeURIComponent(`${job.title} at ${job.recruiterProfile.company} — Apply on GeniePro Healthcare`)
  const waLink  = `https://wa.me/?text=${shareText}%20${encodeURIComponent(jobUrl)}`
  const liLink  = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`
  const twLink  = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(jobUrl)}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/jobs" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5">Sign In</Link>
            <Link href="/auth/register" className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90" style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: job content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${specStyle}`}>
                {job.specialty.replace("_", " ")}
              </span>
              <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3">{job.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-gray-400" />{job.recruiterProfile.company}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{location}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{TYPE_LABEL[job.type] ?? job.type}</span>
                {posted && <span className="flex items-center gap-1.5 text-gray-400">Posted {posted}</span>}
              </div>

              {salary && (
                <p className="text-xl font-bold flex items-center gap-1.5 mb-5" style={{ color: "#2EC4B6" }}>
                  <DollarSign className="h-5 w-5" />{salary}
                </p>
              )}

              {/* Share row */}
              <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400 mr-1 flex items-center gap-1"><Share2 className="h-3.5 w-3.5" /> Share:</span>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors">
                  WhatsApp
                </a>
                <a href={liLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                  LinkedIn
                </a>
                <a href={twLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-700 transition-colors">
                  X / Twitter
                </a>
                <CopyLinkButton url={jobUrl} />
              </div>
            </div>

            {/* Description */}
            {descLines.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3">Job Description</h2>
                <div className="space-y-2">
                  {descLines.map((line, i) => <p key={i} className="text-sm text-gray-600 leading-relaxed">{line}</p>)}
                </div>
              </div>
            )}

            {/* Requirements */}
            {reqLines.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3">Requirements</h2>
                <ul className="space-y-2">
                  {reqLines.map((line, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="text-gray-400 shrink-0 mt-0.5">•</span>{line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {benLines.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-3">Benefits</h2>
                <ul className="space-y-2">
                  {benLines.map((line, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />{line}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right: sidebar ── */}
          <div className="space-y-4">

            {/* Apply card */}
            <div className="rounded-2xl p-6 sticky top-20" style={{ background: "#0f1f38" }}>
              <p className="font-bold text-white mb-1">Ready to Apply?</p>
              <p className="text-xs text-white/50 mb-5">Join GeniePro Healthcare and get matched with top healthcare roles.</p>

              {applyUrl ? (
                <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                  className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "#2EC4B6" }}>
                  <Send className="h-4 w-4" /> Apply Now
                </a>
              ) : (
                <Link href={`/auth/register?jobId=${id}`}
                  className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ background: "#2EC4B6" }}>
                  <Send className="h-4 w-4" /> Apply Now
                </Link>
              )}

              <Link href="/auth/login"
                className="w-full mt-2 h-10 rounded-xl text-sm font-medium flex items-center justify-center border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
                Already have an account? Sign in
              </Link>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold text-gray-900">{applicationCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" /> Applicants
                  </p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{("viewCount" in job ? job.viewCount : 0)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Views</p>
                </div>
              </div>
            </div>

            {/* Employer */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">About the Employer</p>
              <p className="text-sm font-semibold text-gray-900 mb-1">{job.recruiterProfile.company}</p>
              {location && <p className="text-xs text-gray-400 mb-2">{location}</p>}
              {job.recruiterProfile.description && (
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{job.recruiterProfile.description}</p>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Structured data for Google */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "datePosted": job.postedAt,
        "hiringOrganization": { "@type": "Organization", "name": job.recruiterProfile.company },
        "jobLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": job.location } },
        "employmentType": job.type,
        "url": jobUrl,
      })}} />
    </div>
  )
}

