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
  const status = searchParams.get("status") ?? "PENDING"
  const reviews = await prisma.review.findMany({
    where: status === "ALL" ? {} : { status },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(reviews)
}
