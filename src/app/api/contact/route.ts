import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, email, message } = parsed.data

    // Send email via nodemailer if SMTP is configured
    const smtpHost = process.env.SMTP_HOST
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const contactEmail = process.env.CONTACT_EMAIL || "info@genieprohealthcare.com"

    if (smtpHost && smtpUser && smtpPass) {
      const nodemailer = await import("nodemailer")
      const transporter = nodemailer.default.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
      })

      await transporter.sendMail({
        from: `"GeniePro Contact" <${smtpUser}>`,
        to: contactEmail,
        replyTo: email,
        subject: `New contact message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px">
            <h2 style="color:#1F2937">New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0"/>
            <p style="white-space:pre-wrap;color:#374151">${message}</p>
          </div>
        `,
      })
    } else {
      // Log to console if SMTP not configured (useful for dev)
      console.log("[Contact Form]", { name, email, message })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Contact API]", err)
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 })
  }
}
