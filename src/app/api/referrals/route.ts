import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { refereeEmail } = await req.json()
    if (!refereeEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Get session if available (optional — public refer page doesn't require login)
    const session = await getServerSession(authOptions).catch(() => null)
    const referrerId = session?.user?.id ?? "anonymous"

    const referral = await prisma.referral.create({
      data: {
        referrerId,
        refereeEmail,
        status: "PENDING",
      },
    })
    return NextResponse.json({ success: true, referral }, { status: 201 })
  } catch (error) {
    console.error("[REFERRALS]", error)
    return NextResponse.json({ error: "Failed to create referral" }, { status: 500 })
  }
}
