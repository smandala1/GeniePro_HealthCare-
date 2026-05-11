import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const RecruiterProfileSchema = z.object({
  name:        z.string().min(1).max(100).optional(),
  company:     z.string().min(1).max(200).optional(),
  position:    z.string().max(100).optional(),
  phone:       z.string().max(20).optional(),
  website:     z.string().url().optional().or(z.literal("")),
  description: z.string().max(2000).optional(),
  address:     z.string().max(200).optional(),
  city:        z.string().max(100).optional(),
  state:       z.string().max(50).optional(),
  logoUrl:     z.string().url().optional().or(z.literal("")),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
  })
  return NextResponse.json(profile)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = RecruiterProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 })
  }

  const { name, ...profileData } = parsed.data

  if (name) {
    await prisma.user.update({ where: { id: session.user.id }, data: { name } })
  }

  const profile = await prisma.recruiterProfile.upsert({
    where: { userId: session.user.id },
    update: profileData,
    create: { userId: session.user.id, company: profileData.company || "My Company", ...profileData },
  })

  return NextResponse.json(profile)
}
