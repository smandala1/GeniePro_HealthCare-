import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_MAX_AGE_DAYS = 21 // 3 weeks

/**
 * GET/POST /api/cron/expire-jobs
 * Marks recruiter-posted (non-Ceipal) ACTIVE jobs as EXPIRED once they've
 * been posted longer than `days` (default 21).
 *
 * Triggered by Vercel Cron (see vercel.json), which sends a GET request and
 * auto-injects `Authorization: Bearer $CRON_SECRET`. Admins may also trigger
 * it manually (GET or POST) from a logged-in session.
 *
 * Auth: Authorization: Bearer <CRON_SECRET>  OR  an ADMIN session.
 * Query params: ?days=21 (optional override)
 */
async function handler(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? ""
  const providedSecret = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
  const cronSecret = process.env.CRON_SECRET

  const hasValidSecret = Boolean(cronSecret) && providedSecret === cronSecret

  if (!hasValidSecret) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const { searchParams } = new URL(req.url)
  const days = Math.max(1, parseInt(searchParams.get("days") ?? "", 10) || DEFAULT_MAX_AGE_DAYS)
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const result = await prisma.job.updateMany({
    where: {
      status: "ACTIVE",
      ceipalId: null, // only recruiter-posted jobs; Ceipal-synced jobs are managed externally
      postedAt: { lte: cutoff },
    },
    data: { status: "EXPIRED" },
  })

  return NextResponse.json({
    ok: true,
    expired: result.count,
    cutoffDays: days,
    cutoffDate: cutoff.toISOString(),
    ranAt: new Date().toISOString(),
  })
}

export { handler as GET, handler as POST }
