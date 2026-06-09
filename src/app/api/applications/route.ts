import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ApplicationSchema } from "@/lib/validations"
import { sendApplicationNotification } from "@/lib/email"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get("jobId")

  if (session.user.role === "CANDIDATE") {
    const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json([])
    const apps = await prisma.application.findMany({
      where: { candidateId: profile.id },
      include: {
        job: { include: { recruiterProfile: { select: { company: true, logoUrl: true } } } },
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
      orderBy: { appliedAt: "desc" },
    })
    return NextResponse.json(apps)
  }

  if (session.user.role === "RECRUITER") {
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile) return NextResponse.json([])
    const where: Record<string, unknown> = { job: { recruiterId: profile.id } }
    if (jobId) where.jobId = jobId
    const apps = await prisma.application.findMany({
      where,
      include: {
        candidateProfile: {
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } },
          },
          // phone is a scalar on candidateProfile — included by default, no extra select needed
        },
        job: { select: { id: true, title: true, specialty: true, location: true } },
      },
      orderBy: { appliedAt: "desc" },
    })
    return NextResponse.json(apps)
  }

  if (session.user.role === "ADMIN") {
    const safeInt = (val: string | null, fallback: number) => { const n = parseInt(val ?? "", 10); return Number.isFinite(n) ? n : fallback }
    const page  = Math.max(1, safeInt(searchParams.get("page"), 1))
    const limit = Math.max(1, Math.min(100, safeInt(searchParams.get("limit"), 50)))
    const [apps, total] = await Promise.all([
      prisma.application.findMany({
        include: {
          job: { select: { title: true } },
          candidateProfile: { include: { user: { select: { name: true } } } },
        },
        orderBy: { appliedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count(),
    ])
    return NextResponse.json({ apps, total, page, totalPages: Math.ceil(total / limit) })
  }

  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = ApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }
  const { jobId, coverLetter } = parsed.data
  const bodyResumeUrl: string | undefined = typeof body.resumeUrl === "string" ? body.resumeUrl : undefined

  const profile = await prisma.candidateProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId, candidateId: profile.id } },
  })
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 })

  const app = await prisma.application.create({
    data: {
      jobId,
      candidateId: profile.id,
      coverLetter,
      resumeUrlSnapshot: bodyResumeUrl || profile.resumeUrl,
    },
  })
  await prisma.applicationStatusHistory.create({
    data: { applicationId: app.id, toStatus: "APPLIED", changedBy: session.user.id },
  })

  // ── Fire notifications (non-blocking) ────────────────────────────────────
  void notifyNewApplication({ app, profile, session, jobId }).catch((e) =>
    console.error("[applications] notification error:", e)
  )

  return NextResponse.json(app, { status: 201 })
}

// ── Notification helper (runs after response is sent) ─────────────────────────
async function notifyNewApplication({
  app,
  profile,
  session,
  jobId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any
  jobId: string
}) {
  const BASE_URL = process.env.NEXTAUTH_URL || "https://genieprohealthcare.com"

  // Load job + recruiter + candidate details in parallel
  const [job, candidateUser, admins] = await Promise.all([
    prisma.job.findUnique({
      where: { id: jobId },
      include: { recruiterProfile: { include: { user: true } } },
    }),
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.user.findMany({ where: { role: "ADMIN", isActive: true } }),
  ])

  if (!job || !candidateUser) return

  const candidateName  = candidateUser.name
  const candidateEmail = candidateUser.email
  const candidatePhone = profile.phone ?? null
  const jobTitle       = job.title
  const jobLocation    = job.location
  const appliedAt      = app.createdAt ?? new Date()
  const recruiter      = job.recruiterProfile
  const notifTitle     = `New application: ${candidateName}`
  const notifBody      = `${candidateName} applied for "${jobTitle}"`

  // ── Recruiter ────────────────────────────────────────────────────────────
  if (recruiter) {
    const link = `${BASE_URL}/dashboard/recruiter/applications?jobId=${jobId}`
    await Promise.all([
      // In-app notification
      prisma.notification.create({
        data: {
          userId: recruiter.userId,
          type:   "NEW_APPLICATION",
          title:  notifTitle,
          body:   notifBody,
          link:   `/dashboard/recruiter/applications?jobId=${jobId}`,
        },
      }),
      // Email
      sendApplicationNotification({
        to:            recruiter.user.email,
        toName:        recruiter.user.name,
        candidateName,
        candidateEmail,
        candidatePhone,
        jobTitle,
        jobLocation,
        appliedAt,
        dashboardLink: link,
      }),
    ])
  }

  // ── Admins ───────────────────────────────────────────────────────────────
  const adminLink = `${BASE_URL}/dashboard/admin/applications`
  await Promise.all(
    admins.map((admin) =>
      Promise.all([
        prisma.notification.create({
          data: {
            userId: admin.id,
            type:   "NEW_APPLICATION",
            title:  notifTitle,
            body:   notifBody,
            link:   "/dashboard/admin/applications",
          },
        }),
        sendApplicationNotification({
          to:            admin.email,
          toName:        admin.name,
          candidateName,
          candidateEmail,
          candidatePhone,
          jobTitle,
          jobLocation,
          appliedAt,
          dashboardLink: adminLink,
          isAdmin:       true,
        }),
      ])
    )
  )
}
