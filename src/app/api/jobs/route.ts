import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { JobPostingSchema } from "@/lib/validations"
import { isCustomJobsConfigured, fetchAllCustomCeipalJobs } from "@/lib/ceipal"

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
  const daysAgo     = safeInt(searchParams.get("daysAgo"), 0)

  // ── Live Ceipal path + locally-posted recruiter jobs ─────────────────────
  if (isCustomJobsConfigured() && !mine && !recruiterId) {
    try {
      // 1. Ceipal jobs
      let ceipalJobs = await fetchAllCustomCeipalJobs()
      if (status === "ACTIVE") ceipalJobs = ceipalJobs.filter((j) => j.status === "ACTIVE")
      if (specialty) ceipalJobs = ceipalJobs.filter((j) => j.specialty === specialty)
      if (type)      ceipalJobs = ceipalJobs.filter((j) => j.type      === type)
      if (keyword) {
        const kw = keyword.toLowerCase()
        ceipalJobs = ceipalJobs.filter((j) =>
          j.title.toLowerCase().includes(kw) ||
          (j.description ?? "").toLowerCase().includes(kw) ||
          (j.requirements ?? "").toLowerCase().includes(kw)
        )
      }
      if (location) {
        const loc = location.toLowerCase()
        ceipalJobs = ceipalJobs.filter((j) => j.location.toLowerCase().includes(loc))
      }
      if (daysAgo > 0) {
        const cutoff = Date.now() - daysAgo * 24 * 60 * 60 * 1000
        ceipalJobs = ceipalJobs.filter((j) => j.postedAt && new Date(j.postedAt).getTime() >= cutoff)
      }

      // 2. Recruiter-posted DB jobs (ceipalId null = not synced from Ceipal)
      const dbWhere: Record<string, unknown> = { status, ceipalId: null }
      if (specialty) dbWhere.specialty = specialty
      if (type)      dbWhere.type      = type
      if (keyword)   dbWhere.OR        = [
        { title:       { contains: keyword } },
        { description: { contains: keyword } },
        { location:    { contains: keyword } },
      ]
      if (location) dbWhere.location = { contains: location }
      if (daysAgo > 0) dbWhere.postedAt = { gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) }
      dbWhere.AND = [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }]

      const dbJobs = await prisma.job.findMany({
        where: dbWhere,
        include: {
          recruiterProfile: { select: { company: true, logoUrl: true, city: true, state: true } },
          _count: { select: { applications: true } },
        },
      })

      // 3. Merge and sort: featured first, then newest-first
      const combined = [...dbJobs, ...ceipalJobs] as Array<{ isFeatured: boolean; postedAt: string | null }>
      combined.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1
        const aTime = a.postedAt ? new Date(a.postedAt).getTime() : 0
        const bTime = b.postedAt ? new Date(b.postedAt).getTime() : 0
        return bTime - aTime
      })

      const total     = combined.length
      const paginated = combined.slice((page - 1) * limit, page * limit)
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
  if (daysAgo > 0) where.postedAt = { gte: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) }
  where.AND = [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }]

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
