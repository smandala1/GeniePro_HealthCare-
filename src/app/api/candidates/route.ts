import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["RECRUITER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const specialty = searchParams.get("specialty")
  const keyword = searchParams.get("keyword")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")

  const where: Record<string, unknown> = {}
  if (specialty) where.specialty = specialty
  if (keyword) {
    where.OR = [
      { user: { name: { contains: keyword } } },
      { bio: { contains: keyword } },
    ]
  }

  const [candidates, total] = await Promise.all([
    prisma.candidateProfile.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true, isActive: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.candidateProfile.count({ where }),
  ])

  return NextResponse.json({ candidates, total, page, totalPages: Math.ceil(total / limit) })
}
