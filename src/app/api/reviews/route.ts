import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status") ?? "APPROVED"
  const reviews = await prisma.review.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(reviews)
}

export async function POST(req: NextRequest) {
  try {
    const { name, role, rating, body, userId } = await req.json()
    if (!name || !role || !body || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }
    if (body.length > 300) {
      return NextResponse.json({ error: "Review must be 300 characters or less" }, { status: 400 })
    }
    const review = await prisma.review.create({
      data: { name, role, rating, body, userId: userId ?? null, status: "PENDING" },
    })
    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
