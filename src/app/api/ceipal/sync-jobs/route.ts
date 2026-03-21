import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  getCeipalJobs,
  isCeipalEnabled,
  mapCeipalType,
  mapCeipalStatus,
  inferSpecialty,
  extractSalary,
  type CeipalJob,
} from "@/lib/ceipal"

/**
 * POST /api/ceipal/sync-jobs
 * Fetches jobs from Ceipal and upserts them into the local Job table.
 * Requires ADMIN role.
 *
 * Body (optional):
 *   { posted_ago_days?: string, job_status?: string, limit?: string }
 *
 * Response:
 *   { created: number, updated: number, skipped: number, errors: string[] }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isCeipalEnabled()) {
    return NextResponse.json(
      { error: "Ceipal integration is not configured. Set CEIPAL_USERNAME, CEIPAL_PASSWORD, and CEIPAL_API_KEY in .env.local." },
      { status: 503 }
    )
  }

  // Parse optional body params
  let posted_ago_days: string | undefined
  let job_status: string | undefined
  let limit: string | undefined

  try {
    const body = await req.json().catch(() => ({}))
    posted_ago_days = body.posted_ago_days
    job_status      = body.job_status
    limit           = body.limit ?? "100"
  } catch {
    limit = "100"
  }

  // Find a recruiter profile to own synced jobs
  // Using the first available RecruiterProfile (configure a dedicated one in production)
  const systemRecruiter = await prisma.recruiterProfile.findFirst({
    orderBy: { createdAt: "asc" },
  })

  if (!systemRecruiter) {
    return NextResponse.json(
      { error: "No RecruiterProfile found. Create at least one recruiter account before syncing." },
      { status: 422 }
    )
  }

  // Fetch from Ceipal
  let ceipalJobs: CeipalJob[]
  try {
    const data = await getCeipalJobs({ limit, job_status, posted_ago_days })
    ceipalJobs = data.results ?? data.data ?? []
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch from Ceipal"
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Upsert each job
  let created = 0
  let updated  = 0
  let skipped  = 0
  const errors: string[] = []

  for (const cj of ceipalJobs) {
    try {
      if (!cj.id || !cj.position_title) { skipped++; continue }

      const { min: salaryMin, max: salaryMax } = extractSalary(cj.pay_rates)
      const specialty = inferSpecialty(cj.position_title, cj.skills)
      const type      = mapCeipalType(cj.employment_type)
      const status    = mapCeipalStatus(cj.job_status)
      const location  = [cj.city, cj.state, cj.country].filter(Boolean).join(", ") || "Remote"
      const description = cj.requisition_description?.trim() || cj.position_title

      const payload = {
        title:       cj.position_title,
        specialty,
        type,
        status,
        location,
        city:        cj.city        ?? null,
        state:       cj.state       ?? null,
        country:     cj.country     ?? null,
        description,
        requirements: cj.skills ?? "",
        salaryMin,
        salaryMax,
        postedAt:    cj.created ? new Date(cj.created) : new Date(),
        recruiterId: systemRecruiter.id,
      }

      const existing = await prisma.job.findUnique({ where: { ceipalId: cj.id } })

      if (existing) {
        await prisma.job.update({ where: { ceipalId: cj.id }, data: payload })
        updated++
      } else {
        await prisma.job.create({ data: { ...payload, ceipalId: cj.id } })
        created++
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Job ${cj.id} (${cj.position_title}): ${msg}`)
    }
  }

  return NextResponse.json({
    ok: true,
    fetched: ceipalJobs.length,
    created,
    updated,
    skipped,
    errors,
    syncedAt: new Date().toISOString(),
  })
}

/**
 * GET /api/ceipal/sync-jobs
 * Returns the count of locally synced Ceipal jobs (ceipalId is set).
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const count = await prisma.job.count({ where: { ceipalId: { not: null } } })
  return NextResponse.json({ syncedJobCount: count, isConfigured: isCeipalEnabled() })
}
