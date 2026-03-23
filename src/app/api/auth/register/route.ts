import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { RegisterSchema } from "@/lib/validations"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = RegisterSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
        role: data.role,
      },
    })

    if (data.role === "CANDIDATE") {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          profession: data.profession,
          licensedStates: data.licensedStates ? JSON.stringify(data.licensedStates) : "[]",
          preferredStates: data.preferredStates ? JSON.stringify(data.preferredStates) : "[]",
          compactLicense: data.compactLicense ?? false,
          smsConsent: data.smsConsent ?? false,
        },
      })
    } else if (data.role === "RECRUITER") {
      await prisma.recruiterProfile.create({
        data: { userId: user.id, company: data.company || "My Company" },
      })
    }

    return NextResponse.json({ message: "Account created" }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
