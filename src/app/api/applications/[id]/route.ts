import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const current = await prisma.application.findUnique({ where: { id } })
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const app = await prisma.application.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.recruiterNotes !== undefined && { recruiterNotes: body.recruiterNotes }),
      ...(body.interviewDate && { interviewDate: new Date(body.interviewDate) }),
      ...(body.offerAmount && { offerAmount: body.offerAmount }),
    },
  })

  if (body.status && body.status !== current.status) {
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId: id,
        fromStatus: current.status,
        toStatus: body.status,
        changedBy: session.user.id,
        note: body.note,
      },
    })
  }

  return NextResponse.json(app)
}
