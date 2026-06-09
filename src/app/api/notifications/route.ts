import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET — fetch notifications for the current user (latest 30)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length
  return NextResponse.json({ notifications, unreadCount })
}

// PATCH — mark notifications as read
// Body: { ids: string[] } to mark specific ones, or {} to mark all
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body.ids) ? body.ids : []

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      ...(ids.length > 0 ? { id: { in: ids } } : {}),
    },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}
