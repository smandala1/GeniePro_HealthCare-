import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const role = searchParams.get("role")
  const keyword = searchParams.get("keyword")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  const where: Record<string, unknown> = {}
  if (role) where.role = role
  if (keyword) where.OR = [{ name: { contains: keyword } }, { email: { contains: keyword } }]

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true,
        isActive: true, createdAt: true, avatarUrl: true,
        recruiterProfile: role === "RECRUITER" ? {
          select: { company: true, position: true, phone: true, website: true, city: true, state: true }
        } : false,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])
  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) })
}
