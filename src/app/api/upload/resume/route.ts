import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTS = [".pdf", ".doc", ".docx"]

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
    }
    const ext = path.extname(file.name).toLowerCase()
    if (!ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ error: "Invalid file type. PDF, DOC, DOCX only." }, { status: 400 })
    }

    const id = (formData.get("userId") as string) || `tmp-${Date.now()}`
    const filename = `${id}-${Date.now()}${ext}`
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
