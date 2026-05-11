import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTS = [".pdf", ".doc", ".docx"]
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum allowed size is 5MB." },
        { status: 400 }
      )
    }

    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file extension. Only .pdf, .doc, and .docx files are allowed." },
        { status: 400 }
      )
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, DOC, and DOCX MIME types are accepted." },
        { status: 400 }
      )
    }

    // Always use the authenticated session user's ID — never trust client-supplied userId
    const safeId = session.user.id.replace(/[^a-zA-Z0-9_-]/g, "")
    const filename = `${safeId}-${Date.now()}${ext}`
    const dir = path.join(process.cwd(), "public", "uploads", "resumes")

    await mkdir(dir, { recursive: true })
    const bytes = await file.arrayBuffer()
    await writeFile(path.join(dir, filename), Buffer.from(bytes))

    return NextResponse.json({ url: `/uploads/resumes/${filename}` })
  } catch (e) {
    console.error("Resume upload error:", e)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
