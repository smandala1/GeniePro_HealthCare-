import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { JobPostingSchema } from "@/lib/validations"
import { isCustomJobsConfigured, fetchCustomCeipalJobById } from "@/lib/ceipal"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Try DB first
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      recruiterProfile: { select: { company: true, logoUrl: true, city: true, state: true, description: true } },
      _count: { select: { applications: true } },
    },
  })

  if (job) {
    await prisma.job.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})
    return NextResponse.json(job)
  }

  // Fall back to Ceipal for live job IDs not in DB
  if (isCustomJobsConfigured()) {
    try {
      const ceipalJob = await fetchCustomCeipalJobById(id)
      if (ceipalJob) return NextResponse.json(ceipalJob)
    } catch {
      // Ceipal unavailable — fall through to 404
    }
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.job.findUnique({
    where: { id },
    include: { recruiterProfile: { select: { userId: true } } },
  })
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  // Recruiters may only edit their own jobs; admins may edit any
  if (session.user.role === "RECRUITER" && existing.recruiterProfile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()

  // Strip dangerous fields from the body before validation
  const STRIP = new Set(["recruiterId", "id", "ceipalId", "viewCount"])
  const safeBody = Object.fromEntries(Object.entries(body as Record<string, unknown>).filter(([k]) => !STRIP.has(k)))

  // Partial validation — only validate fields that are present
  const parsed = JobPostingSchema.partial().safeParse(safeBody)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  const job = await prisma.job.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(body.status ? { status: body.status } : {}),
      ...(body.status === "ACTIVE" && !existing.postedAt ? { postedAt: new Date() } : {}),
    },
  })
  return NextResponse.json(job)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.job.findUnique({
    where: { id },
    include: { recruiterProfile: { select: { userId: true } } },
  })
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  if (session.user.role === "RECRUITER" && existing.recruiterProfile.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.job.update({ where: { id }, data: { status: "CLOSED" } })
  return NextResponse.json({ message: "Job closed" })
}
