import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { workHistory: { orderBy: { startDate: "desc" } } },
  })
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { name, ...profileData } = body

  if (name) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name } })
  }

  const profile = await prisma.candidateProfile.upsert({
    where: { userId: session.user.id },
    update: profileData,
    create: { userId: session.user.id, ...profileData },
  })

  return NextResponse.json(profile)
}
