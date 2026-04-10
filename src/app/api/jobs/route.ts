import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { JobPostingSchema } from "@/lib/validations"
import {
  getCeipalJobs,
  isCeipalEnabled,
  mapCeipalType,
  mapCeipalStatus,
  inferSpecialty,
  extractSalary,
  type CeipalJob,
} from "@/lib/ceipal"

// Transform a raw Ceipal job into the shape the frontend expects
function ceipalJobToResponse(cj: CeipalJob) {
  const { min: salaryMin, max: salaryMax } = extractSalary(cj.pay_rates)
  const location = [cj.city, cj.state, cj.country].filter(Boolean).join(", ") || "Remote"

  return {
    id:          cj.id,
    title:       cj.position_title,
    specialty:   inferSpecialty(cj.position_title, cj.skills),
    type:        mapCeipalType(cj.employment_type),
    status:      mapCeipalStatus(cj.job_status),
    location,
    city:        cj.city        ?? null,
    state:       cj.state       ?? null,
    salaryMin,
    salaryMax,
    salaryType:  salaryMin || salaryMax ? "ANNUAL" : null,
    description: cj.requisition_description?.trim() || cj.position_title,
    requirements: cj.skills ?? null,
    benefits:    null,
    isRemote:    false,
    isFeatured:  false,
    experienceRequired: null,
    postedAt:    cj.created ?? null,
    viewCount:   0,
    recruiterProfile: {
      company: "GeniePro Healthcare",
      logoUrl: null,
      city:    cj.city  ?? null,
      state:   cj.state ?? null,
    },
    _count: { applications: 0 },
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const specialty  = searchParams.get("specialty")
  const type       = searchParams.get("type")
  const keyword    = searchParams.get("keyword")
  const location   = searchParams.get("location")
  const page       = parseInt(searchParams.get("page")  || "1")
  const limit      = parseInt(searchParams.get("limit") || "12")
  const status     = searchParams.get("status") || "ACTIVE"
  const recruiterId = searchParams.get("recruiterId")
  const mine       = searchParams.get("mine") === "true"

  // ── Ceipal live path (used on Vercel / when credentials are set) ──────────
  if (isCeipalEnabled() && !mine && !recruiterId) {
    try {
      const data = await getCeipalJobs({
        limit:      String(limit * page + 50), // over-fetch so we can paginate client-side
        job_status: status === "ACTIVE" ? "open" : undefined,
        searchkey:  keyword   ?? undefined,
        state:      location  ?? undefined,
      })

      let jobs = (data.results ?? data.data ?? []).map(ceipalJobToResponse)

      // Client-side filters Ceipal doesn't support natively
      if (specialty) jobs = jobs.filter((j) => j.specialty === specialty)
      if (type)      jobs = jobs.filter((j) => j.type      === type)
      if (keyword)   jobs = jobs.filter((j) =>
        j.title.toLowerCase().includes(keyword.toLowerCase()) ||
        j.description.toLowerCase().includes(keyword.toLowerCase())
      )
      if (status === "ACTIVE") jobs = jobs.filter((j) => j.status === "ACTIVE")

      const total     = jobs.length
      const paginated = jobs.slice((page - 1) * limit, page * limit)

      return NextResponse.json({
        jobs:       paginated,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch from Ceipal"
      console.error("[/api/jobs] Ceipal error:", message)
      // On Vercel there is no persistent DB, so return empty rather than 500
      return NextResponse.json({ jobs: [], total: 0, page, totalPages: 0 })
    }
  }

  // ── DB path (local dev / fallback) ────────────────────────────────────────
  const where: Record<string, unknown> = { status }
  if (specialty)    where.specialty    = specialty
  if (type)         where.type         = type
  if (recruiterId)  where.recruiterId  = recruiterId

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
    const message = error instanceof Error ? error.message : "Failed to fetch jobs"
    return NextResponse.json({ error: message, jobs: [], total: 0 }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = JobPostingSchema.parse(body)

    const recruiterProfile = await prisma.recruiterProfile.findUnique({
      where: { userId: session.user.id },
    })
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
