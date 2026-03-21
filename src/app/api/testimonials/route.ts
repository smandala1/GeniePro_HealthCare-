import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name, role, company, content, rating } = await req.json()
  if (!name || !content) {
    return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
  }

  const testimonial = await prisma.testimonial.create({
    data: { name, role: role || "", company, content, rating: rating ?? 5 },
  })
  return NextResponse.json(testimonial, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, ...data } = await req.json()
  const testimonial = await prisma.testimonial.update({ where: { id }, data })
  return NextResponse.json(testimonial)
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await req.json()
  await prisma.testimonial.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
