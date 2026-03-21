import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCeipalJobs, isCeipalEnabled } from "@/lib/ceipal"

/**
 * GET /api/ceipal/jobs
 * Proxy to Ceipal getJobPostingsList — admin only.
 * Query params forwarded: limit, job_status, searchkey, state, city, JobType, posted_ago_days
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isCeipalEnabled()) {
    return NextResponse.json({ error: "Ceipal integration is not configured" }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const data = await getCeipalJobs({
      limit:           searchParams.get("limit")           ?? "50",
      job_status:      searchParams.get("job_status")      ?? undefined,
      searchkey:       searchParams.get("searchkey")       ?? undefined,
      state:           searchParams.get("state")           ?? undefined,
      city:            searchParams.get("city")            ?? undefined,
      JobType:         searchParams.get("JobType")         ?? undefined,
      posted_ago_days: searchParams.get("posted_ago_days") ?? undefined,
    })

    const jobs = data.results ?? data.data ?? []
    return NextResponse.json({ jobs, total: data.count ?? data.total ?? jobs.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
