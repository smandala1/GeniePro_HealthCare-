import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendStatusChangeNotification } from "@/lib/email"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const current = await prisma.application.findUnique({
    where: { id },
    include: { job: { select: { recruiterId: true } } },
  })
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Recruiters may only update applications for jobs they own
  if (session.user.role === "RECRUITER") {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } })
    if (!recruiterProfile || current.job.recruiterId !== recruiterProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (session.user.role === "CANDIDATE") {
    // Candidates may only withdraw their own applications
    const candidateProfile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
    if (!candidateProfile || current.candidateId !== candidateProfile.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (body.status && body.status !== "WITHDRAWN") {
      return NextResponse.json({ error: "Candidates may only withdraw applications" }, { status: 403 })
    }
  }

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
    // Notify candidate + create in-app notification (non-blocking)
    void notifyCandidateStatusChange(id, body.status, current.status).catch(() => {})
  }

  return NextResponse.json(app)
}

async function notifyCandidateStatusChange(applicationId: string, newStatus: string, oldStatus: string) {
  const BASE_URL = process.env.NEXTAUTH_URL || "https://genieprohealthcare.com"
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      job: { include: { recruiterProfile: { select: { company: true } } } },
      candidateProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  })
  if (!app) return

  const candidate = app.candidateProfile.user
  const dashboardLink = `${BASE_URL}/dashboard/candidate/applications`

  const STATUS_TITLES: Record<string, string> = {
    SCREENING: "Your application is under review",
    INTERVIEW: "Interview request received",
    OFFER:     "You have received an offer",
    HIRED:     "You've been hired!",
    REJECTED:  "Application update",
    WITHDRAWN: "Application withdrawn",
  }

  await Promise.all([
    // In-app notification
    prisma.notification.create({
      data: {
        userId: candidate.id,
        type:   "STATUS_CHANGE",
        title:  STATUS_TITLES[newStatus] ?? `Application status updated`,
        body:   `Your application for "${app.job.title}" at ${app.job.recruiterProfile.company} is now: ${newStatus}`,
        link:   "/dashboard/candidate/applications",
      },
    }),
    // Email
    sendStatusChangeNotification({
      to:            candidate.email,
      name:          candidate.name,
      jobTitle:      app.job.title,
      company:       app.job.recruiterProfile.company,
      newStatus,
      dashboardLink,
    }),
  ])

  void oldStatus // suppress lint
}
