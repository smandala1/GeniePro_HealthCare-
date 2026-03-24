import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { status } = await req.json()
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const existing = await prisma.review.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: "Review not found" }, { status: 404 })

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json(review)
  } catch {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}
