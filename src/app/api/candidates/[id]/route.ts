import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CandidateProfileSchema } from "@/lib/validations"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isMe = id === "me"
  const profile = isMe
    ? await prisma.candidateProfile.findUnique({
        where: { userId: session.user.id },
        include: { user: true, workHistory: { orderBy: { startDate: "desc" } } },
      })
    : await prisma.candidateProfile.findUnique({
        where: { id },
        include: { user: { select: { name: true, email: true, avatarUrl: true } }, workHistory: true },
      })

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const data = CandidateProfileSchema.parse(body)

  const updateData: Record<string, unknown> = {
    ...data,
    skills: data.skills ? JSON.stringify(data.skills) : undefined,
    certifications: data.certifications ? JSON.stringify(data.certifications) : undefined,
  }
  Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k])

  const where = id === "me" ? { userId: session.user.id } : { id }
  const profile = await prisma.candidateProfile.update({ where, data: updateData })
  return NextResponse.json(profile)
}
