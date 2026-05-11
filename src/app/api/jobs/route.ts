import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { JobPostingSchema } from "@/lib/validations"

// ── Ceipal config ─────────────────────────────────────────────────────────────
const CEIPAL_AUTH_URL = process.env.CEIPAL_AUTH_URL ?? "https://api.ceipal.com/v1/createAuthtoken/"
const CEIPAL_JOBS_URL = process.env.CEIPAL_JOBS_URL ?? process.env.CEIPAL_API_URL ?? ""
const CEIPAL_USERNAME = process.env.CEIPAL_USERNAME ?? ""
const CEIPAL_PASSWORD = process.env.CEIPAL_PASSWORD ?? ""
const CEIPAL_API_KEY  = process.env.CEIPAL_API_KEY  ?? ""

function isCeipalConfigured() {
  return Boolean(CEIPAL_JOBS_URL && CEIPAL_USERNAME && CEIPAL_PASSWORD && CEIPAL_API_KEY)
}

// ── Token cache (module-level singleton, works across hot-reload in dev) ──────
let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getCeipalToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const res = await fetch(CEIPAL_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:   CEIPAL_USERNAME,
      password: CEIPAL_PASSWORD,
      api_key: CEIPAL_API_KEY,
      json: 1,
    }),
    cache: "no-store",
  })

  if (!res.ok) throw new Error(`Ceipal auth failed: HTTP ${res.status}`)

  // Ceipal returns XML: <root><access_token>...</access_token></root>
  const text = await res.text()
  const match = text.match(/<access_token>(.*?)<\/access_token>/)
  if (!match) throw new Error(`Ceipal auth: no access_token in response: ${text.slice(0, 200)}`)

  cachedToken = match[1]
  tokenExpiresAt = Date.now() + 55 * 60 * 1000 // 55 min (token valid 1 hr)
  return cachedToken
}

// ── Ceipal job shape from their API ──────────────────────────────────────────
interface RawCeipalJob {
  id: string
  job_title?: string
  public_job_title?: string
  job_type?: string
  employment_type?: string
  city?: string
  states?: string
  country?: string
  pay_rate___salary?: string
  client_bill_rate___salary?: string
  job_description?: string
  public_job_description?: string
  job_status?: string
  job_category?: string
  industry?: string
  primary_skills?: string
  secondary_skills?: string
  experience?: string | number
  number_of_positions?: string | number
  duration?: string
  job_start_date?: string
  apply_job?: string
  apply_job_without_registration?: string
  Created?: string
}

// ── Specialty inference from title/skills ────────────────────────────────────
function inferSpecialty(title: string, skills?: string): string {
  const h = `${title} ${skills ?? ""}`.toLowerCase()
  if (/\b(nurs|rn\b|lpn|np\b|cna|icu|er nurse|travel nurse|bls|acls|l&d|labor|delivery)\b/.test(h)) return "NURSING"
  if (/\b(therapist|therapy|radiolog|sonograph|ultrasound|lab|phlebotom|respiratory|rehab|pt\b|ot\b|slp|imaging)\b/.test(h)) return "ALLIED_HEALTH"
  if (/\b(pharma|pharmacist|drug|clinical trial|clinical research|biotech|regulatory|cra\b|crc\b)\b/.test(h)) return "PHARMA"
  if (/\b(billing|coding|admin|manager|coordinator|recruiter|hr\b|health info|hipaa|ehr|emr|medical record)\b/.test(h)) return "NONCLINICAL"
  return "NURSING"
}

function mapJobType(raw?: string): string {
  const t = (raw ?? "").toLowerCase()
  if (t.includes("part")) return "PART_TIME"
  if (t.includes("contract") || t.includes("c2h")) return "CONTRACT"
  if (t.includes("per diem") || t.includes("perdiem")) return "PER_DIEM"
  if (t.includes("travel")) return "TRAVEL"
  if (t.includes("temp")) return "TEMP"
  return "FULL_TIME"
}

function stripHtml(html?: string): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").replace(/&[a-z]+;/gi, " ").trim()
}

function transformJob(cj: RawCeipalJob) {
  const title   = cj.public_job_title || cj.job_title || "Untitled Position"
  const skills  = [cj.primary_skills, cj.secondary_skills].filter(Boolean).join(", ")
  const pay     = cj.pay_rate___salary || cj.client_bill_rate___salary || null
  const desc    = cj.public_job_description || cj.job_description || title
  const location = [cj.city, cj.states].filter(Boolean).join(", ") || cj.country || "United States"

  return {
    id:           cj.id,
    title,
    specialty:    inferSpecialty(title, skills),
    type:         mapJobType(cj.job_type || cj.employment_type),
    status:       (cj.job_status ?? "").toLowerCase() === "active" ? "ACTIVE" : "CLOSED",
    location,
    city:         cj.city  || null,
    state:        cj.states || null,
    salaryMin:    null,
    salaryMax:    null,
    salaryType:   pay ? "HOURLY" : null,
    payDisplay:   pay ? `$${pay}/hr` : null,
    description:  stripHtml(desc),
    requirements: skills || null,
    benefits:     null,
    isRemote:     false,
    isFeatured:   false,
    experienceRequired: cj.experience ? Number(cj.experience) : null,
    postedAt:     cj.Created ? new Date(cj.Created).toISOString() : null,
    viewCount:    0,
    duration:     cj.duration || null,
    openings:     cj.number_of_positions ? Number(cj.number_of_positions) : null,
    applyUrl:     cj.apply_job_without_registration || cj.apply_job || null,
    recruiterProfile: {
      company: "GeniePro Healthcare",
      logoUrl: null,
      city:    cj.city   || null,
      state:   cj.states || null,
    },
    _count: { applications: 0 },
  }
}

// ── Fetch all pages from Ceipal ───────────────────────────────────────────────
async function fetchAllCeipalJobs(): Promise<ReturnType<typeof transformJob>[]> {
  const token = await getCeipalToken()
  const PAGE_SIZE = 20
  const all: ReturnType<typeof transformJob>[] = []
  let page = 1
  let totalPages = 1

  do {
    const url = `${CEIPAL_JOBS_URL}?page=${page}&paging_length=${PAGE_SIZE}`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      // Token may have expired mid-session — invalidate and let retry happen next request
      if (res.status === 401) { cachedToken = null; tokenExpiresAt = 0 }
      throw new Error(`Ceipal jobs API error: HTTP ${res.status}`)
    }

    const text = await res.text()
    // Ceipal sometimes embeds control characters in job descriptions — parse leniently
    const data = JSON.parse(text.replace(/[\x00-\x1F\x7F]/g, (c) =>
      c === "\n" || c === "\r" || c === "\t" ? c : " "
    )) as { count?: number; num_pages?: number; results?: RawCeipalJob[] }

    totalPages = data.num_pages ?? 1
    const results = data.results ?? []
    all.push(...results.map(transformJob))
    page++
  } while (page <= totalPages && page <= 5) // cap at 5 pages (100 jobs) to avoid timeout

  return all
}

function safeInt(val: string | null, fallback: number): number {
  const n = parseInt(val ?? "", 10)
  return Number.isFinite(n) ? n : fallback
}

// ── GET /api/jobs ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const specialty   = searchParams.get("specialty")
  const type        = searchParams.get("type")
  const keyword     = searchParams.get("keyword")
  const location    = searchParams.get("location")
  const page        = Math.max(1,  safeInt(searchParams.get("page"),  1))
  const limit       = Math.max(1, Math.min(50, safeInt(searchParams.get("limit"), 12)))
  const status      = searchParams.get("status") || "ACTIVE"
  const recruiterId = searchParams.get("recruiterId")
  const mine        = searchParams.get("mine") === "true"

  // ── Live Ceipal path ──────────────────────────────────────────────────────
  if (isCeipalConfigured() && !mine && !recruiterId) {
    try {
      let jobs = await fetchAllCeipalJobs()

      // Filter active only
      if (status === "ACTIVE") jobs = jobs.filter((j) => j.status === "ACTIVE")

      // Apply filters
      if (specialty) jobs = jobs.filter((j) => j.specialty === specialty)
      if (type)      jobs = jobs.filter((j) => j.type      === type)
      if (keyword) {
        const kw = keyword.toLowerCase()
        jobs = jobs.filter((j) =>
          j.title.toLowerCase().includes(kw) ||
          (j.description ?? "").toLowerCase().includes(kw) ||
          (j.requirements ?? "").toLowerCase().includes(kw)
        )
      }
      if (location) {
        const loc = location.toLowerCase()
        jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc))
      }

      const total     = jobs.length
      const paginated = jobs.slice((page - 1) * limit, page * limit)

      return NextResponse.json({ jobs: paginated, total, page, totalPages: Math.ceil(total / limit) })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ceipal fetch failed"
      console.error("[/api/jobs] Ceipal error:", message)
      return NextResponse.json({ jobs: [], total: 0, page, totalPages: 0, error: message })
    }
  }

  // ── DB fallback (local dev without Ceipal / recruiter-specific queries) ───
  const where: Record<string, unknown> = { status }
  if (specialty)   where.specialty   = specialty
  if (type)        where.type        = type
  if (recruiterId) where.recruiterId = recruiterId

  if (mine) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role === "RECRUITER") {
      const profile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } })
      if (profile) where.recruiterId = profile.id
    }
  }
  if (keyword) {
    where.OR = [
      { title:       { contains: keyword } },
      { description: { contains: keyword } },
      { location:    { contains: keyword } },
    ]
  }
  if (location) where.location = { contains: location }

  try {
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          recruiterProfile: { select: { company: true, logoUrl: true, city: true, state: true } },
          _count: { select: { applications: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { postedAt: "desc" }],
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.job.count({ where }),
    ])
    return NextResponse.json({ jobs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "DB fetch failed"
    return NextResponse.json({ error: message, jobs: [], total: 0 }, { status: 500 })
  }
}

// ── POST /api/jobs (recruiter creates a job) ──────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const data = JobPostingSchema.parse(body)
    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } })
    if (!recruiterProfile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    const job = await prisma.job.create({
      data: {
        ...data,
        recruiterId: recruiterProfile.id,
        status:   body.publish ? "ACTIVE" : "DRAFT",
        postedAt: body.publish ? new Date() : null,
      },
    })
    return NextResponse.json(job, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create job"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
