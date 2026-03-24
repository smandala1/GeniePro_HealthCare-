import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      recruiterProfile: { select: { company: true, logoUrl: true, city: true, state: true, description: true } },
      _count: { select: { applications: true } },
    },
  })
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.job.update({ where: { id }, data: { viewCount: { increment: 1 } } })
  return NextResponse.json(job)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.job.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const body = await req.json()
  const job = await prisma.job.update({
    where: { id },
    data: {
      ...body,
      ...(body.status === "ACTIVE" && !body.postedAt ? { postedAt: new Date() } : {}),
    },
  })
  return NextResponse.json(job)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const existing = await prisma.job.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  await prisma.job.update({ where: { id }, data: { status: "CLOSED" } })
  return NextResponse.json({ message: "Job closed" })
}
