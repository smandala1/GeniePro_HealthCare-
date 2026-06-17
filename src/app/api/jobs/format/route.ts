import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { title, description, requirements, benefits, company, location, type } = await req.json()

  if (!title || !description) {
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
  }

  const JOB_TYPE_LABEL: Record<string, string> = {
    FULL_TIME: "Full-Time", PART_TIME: "Part-Time", CONTRACT: "Contract",
    PER_DIEM: "Per Diem", TRAVEL: "Travel", TEMP: "Temporary",
  }

  const prompt = `You are an expert healthcare recruiter writing professional job postings.

Format the following raw job information into a polished, LinkedIn-style healthcare job listing.

Job Title: ${title}
Company: ${company || "our organization"}
Location: ${location || ""}
Job Type: ${JOB_TYPE_LABEL[type] ?? type ?? ""}
Raw Description: ${description}
Raw Requirements: ${requirements || ""}
Raw Benefits: ${benefits || ""}

Return ONLY a valid JSON object with exactly these three keys:

{
  "description": "...",
  "requirements": "...",
  "benefits": "..."
}

Rules for "description":
- Start with a 2-sentence company/opportunity intro: why this company, what makes this role exciting
- Then a blank line, then "About the Role" as a plain label on its own line
- Then 2-3 short sentences describing the role and its impact
- Then a blank line, then "Key Responsibilities" as a plain label on its own line
- Then 6-8 bullet points, each starting with "• " on its own line
- Use ONLY the information provided — do not invent details
- Plain text only, no markdown, no asterisks, no hashtags

Rules for "requirements":
- One qualification per line, no bullet prefix (the UI adds bullets automatically)
- Clean up redundancy, fix grammar
- Keep all real requirements from the raw input
- If raw requirements is empty or just "RN" / "CNA", expand logically from the job title and description
- 4-8 lines max

Rules for "benefits":
- One benefit per line, no bullet prefix
- If raw benefits is empty, write 3-4 standard healthcare benefits appropriate for this role type
- 3-6 lines max

Return only the JSON object, nothing else.`

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text.trim()

    // Extract JSON even if model adds extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")
    const formatted = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      description: formatted.description ?? description,
      requirements: formatted.requirements ?? requirements,
      benefits: formatted.benefits ?? benefits,
    })
  } catch (err) {
    console.error("[format-job] error:", err)
    return NextResponse.json({ error: "Formatting failed. Check your ANTHROPIC_API_KEY." }, { status: 500 })
  }
}
