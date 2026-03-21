import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const { refereeEmail } = await req.json()
    if (!refereeEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        refereeEmail,
        status: "PENDING",
      },
    })
    return NextResponse.json(referral, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
  }
}
