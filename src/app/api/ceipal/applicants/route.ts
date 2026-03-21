import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getCeipalApplicants, getCeipalApplicantDetails, isCeipalEnabled } from "@/lib/ceipal"

/**
 * GET /api/ceipal/applicants
 * Proxy to Ceipal getApplicantsList — admin/recruiter only.
 * Add ?id={applicant_id} to fetch a single applicant's details.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !["ADMIN", "RECRUITER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!isCeipalEnabled()) {
    return NextResponse.json({ error: "Ceipal integration is not configured" }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const applicantId = searchParams.get("id")

    if (applicantId) {
      const applicant = await getCeipalApplicantDetails(applicantId)
      return NextResponse.json({ applicant })
    }

    const data = await getCeipalApplicants({
      source:           searchParams.get("source")           ?? undefined,
      applicant_status: searchParams.get("applicant_status") ?? undefined,
      sortby:           searchParams.get("sortby")           ?? undefined,
      sortorder:        searchParams.get("sortorder")        ?? undefined,
    })

    const applicants = data.results ?? data.data ?? []
    return NextResponse.json({ applicants, total: data.count ?? data.total ?? applicants.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
