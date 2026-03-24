import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULTS: Record<string, string> = {
  siteName:        "GeniePro Healthcare",
  siteTagline:     "Connecting Healthcare Professionals",
  supportEmail:    "support@genieprohealthcare.com",
  allowNewSignups: "true",
  requireApproval: "false",
  maintenanceMode: "false",
}

export async function GET() {
  const rows = await prisma.siteSettings.findMany()

  const settings: Record<string, string> = { ...DEFAULTS }
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json() as Record<string, string>

  const upserts = Object.entries(body).map(([key, value]) =>
    prisma.siteSettings.upsert({
      where:  { key },
      create: { key, value },
      update: { value },
    })
  )

  await prisma.$transaction(upserts)

  return NextResponse.json({ success: true })
}
