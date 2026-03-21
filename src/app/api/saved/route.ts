import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json([])

  const saved = await prisma.savedJob.findMany({
    where: { candidateId: profile.id },
    include: {
      job: {
        include: {
          recruiterProfile: { select: { company: true, logoUrl: true, city: true, state: true } },
          _count: { select: { applications: true } },
        },
      },
    },
    orderBy: { savedAt: "desc" },
  })
  return NextResponse.json(saved)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { jobId } = await req.json()
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const saved = await prisma.savedJob.upsert({
    where: { candidateId_jobId: { candidateId: profile.id, jobId } },
    update: {},
    create: { candidateId: profile.id, jobId },
  })
  return NextResponse.json(saved, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { jobId } = await req.json()
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  await prisma.savedJob.deleteMany({
    where: { candidateId: profile.id, jobId },
  })
  return NextResponse.json({ success: true })
}
