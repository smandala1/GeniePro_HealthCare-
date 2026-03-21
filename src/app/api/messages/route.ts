import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ toId: session.user.id }, { fromId: session.user.id }],
      parentId: null,
    },
    include: {
      from: { select: { id: true, name: true, avatarUrl: true, role: true } },
      to: { select: { id: true, name: true, avatarUrl: true, role: true } },
      replies: {
        include: {
          from: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { toId, subject, content, parentId } = await req.json()

  const message = await prisma.message.create({
    data: {
      fromId: session.user.id,
      toId,
      subject,
      content,
      parentId,
    },
  })
  return NextResponse.json(message, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  await prisma.message.update({
    where: { id, toId: session.user.id },
    data: { isRead: true },
  })
  return NextResponse.json({ success: true })
}
