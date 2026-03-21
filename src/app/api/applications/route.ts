import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("jobId")

  if (session.user.role === "CANDIDATE") {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json([])
    const apps = await prisma.application.findMany({
      where: { candidateId: profile.id },
      include: {
        job: { include: { recruiterProfile: { select: { company: true, logoUrl: true } } } },
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
      orderBy: { appliedAt: "desc" },
    })
    return NextResponse.json(apps)
  }

  if (session.user.role === "RECRUITER") {
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json([])
    const where: Record<string, unknown> = { job: { recruiterId: profile.id } }
    if (jobId) where.jobId = jobId
    const apps = await prisma.application.findMany({
      where,
      include: {
        candidateProfile: { include: { user: { select: { name: true, email: true, avatarUrl: true } } } },
        job: { select: { title: true, specialty: true } },
      },
      orderBy: { appliedAt: "desc" },
    })
    return NextResponse.json(apps)
  }

  if (session.user.role === "ADMIN") {
    const apps = await prisma.application.findMany({
      include: {
        job: { select: { title: true } },
        candidateProfile: { include: { user: { select: { name: true } } } },
      },
      orderBy: { appliedAt: "desc" },
      take: 100,
    })
    return NextResponse.json(apps)
  }

  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { jobId, coverLetter } = await req.json()
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId: profile.id } },
  })
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 })

  const app = await prisma.application.create({
    data: {
      jobId,
      candidateId: profile.id,
      coverLetter,
      resumeUrlSnapshot: profile.resumeUrl,
    },
  })
  await prisma.applicationStatusHistory.create({
    data: { applicationId: app.id, toStatus: "APPLIED", changedBy: session.user.id },
  })
  return NextResponse.json(app, { status: 201 })
}
