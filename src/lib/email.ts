import nodemailer from "nodemailer"

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user, pass },
  })
}

export async function sendWelcomeEmail(to: string, name: string) {
  const transporter = getTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: `"GeniePro Healthcare" <${process.env.SMTP_USER}>`,
    to,
    subject: "Welcome to GeniePro Healthcare!",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#2F80ED,#2EC4B6);padding:32px;border-radius:16px 16px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">Welcome to GeniePro Healthcare</h1>
        </div>
        <div style="padding:32px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px">
          <p style="color:#1F2937;font-size:16px">Hi ${name},</p>
          <p style="color:#6B7280;font-size:14px;line-height:1.6">
            Your account has been created successfully. You can now browse thousands of
            verified healthcare job opportunities and apply in seconds.
          </p>
          <a
            href="${process.env.NEXTAUTH_URL || "https://genieprohealthcare.com"}/jobs"
            style="display:inline-block;margin-top:16px;padding:12px 28px;background:linear-gradient(135deg,#2F80ED,#2EC4B6);color:white;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px"
          >
            Browse Open Jobs
          </a>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0"/>
          <p style="color:#9CA3AF;font-size:12px">
            GeniePro Healthcare · 925 North Point Pkwy. Ste 130, Alpharetta, GA 30005<br/>
            <a href="mailto:info@genieprohealthcare.com" style="color:#2F80ED">info@genieprohealthcare.com</a>
          </p>
        </div>
      </div>
    `,
  })
}
