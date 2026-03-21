import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [
    totalUsers, totalJobs, totalApplications, activeJobs,
    jobsBySpecialty, appsByStatus, recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.job.count({ where: { status: "ACTIVE" } }),
    prisma.job.groupBy({ by: ["specialty"], _count: { id: true } }),
    prisma.application.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" }, take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ])

  return NextResponse.json({
    stats: { totalUsers, totalJobs, totalApplications, activeJobs },
    jobsBySpecialty: jobsBySpecialty.map(j => ({ specialty: j.specialty, count: j._count.id })),
    appsByStatus: appsByStatus.map(a => ({ status: a.status, count: a._count.id })),
    recentUsers,
  })
}
