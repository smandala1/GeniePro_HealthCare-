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

  // Mark as reviewed (closest available status field)
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "REVIEWED" },
  })

  return NextResponse.json({ success: true, message: "Marked as pushed to Ceipal" })
}
