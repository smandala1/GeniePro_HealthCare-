import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role

  if (!session || !["RECRUITER", "ADMIN"].includes(role ?? "")) {
    return NextResponse.json({ error: "Only recruiters can push to Ceipal" }, { status: 403 })
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { job: true },
  })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const current = await prisma.application.findUnique({ where: { id: applicationId } })
  if (!current) return NextResponse.json({ error: "Application not found" }, { status: 404 })

  // Advance to SCREENING if still at APPLIED, and record a note
  if (current.status === "APPLIED") {
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "SCREENING" },
    })
    await prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: "APPLIED",
        toStatus: "SCREENING",
        changedBy: session!.user.id,
        note: "Pushed to Ceipal ATS",
      },
    })
  }

  return NextResponse.json({ success: true, message: "Application advanced to Screening and noted as pushed to Ceipal" })
}
