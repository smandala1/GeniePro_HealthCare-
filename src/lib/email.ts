import nodemailer from "nodemailer"

const BASE_URL = process.env.NEXTAUTH_URL || "https://genieprohealthcare.com"
const FROM_NAME = process.env.SMTP_FROM_NAME || "GeniePro Healthcare"
const FROM_EMAIL = process.env.SMTP_USER || "no-reply@genieprohealthcare.com"

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

function emailWrapper(body: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#f8faff;padding:24px">
      <div style="background:linear-gradient(135deg,#2F80ED,#2EC4B6);padding:28px 32px;border-radius:16px 16px 0 0;text-align:center">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700">GeniePro Healthcare</h1>
      </div>
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        ${body}
        <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0"/>
        <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0">
          GeniePro Healthcare · 925 North Point Pkwy. Ste 130, Alpharetta, GA 30005<br/>
          <a href="mailto:info@genieprohealthcare.com" style="color:#2F80ED">info@genieprohealthcare.com</a>
        </p>
      </div>
    </div>
  `
}

async function send(to: string, subject: string, html: string) {
  const transporter = getTransporter()
  if (!transporter) return
  try {
    await transporter.sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to, subject, html })
  } catch (err) {
    console.error("[email] send failed:", err)
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  await send(to, "Welcome to GeniePro Healthcare!", emailWrapper(`
    <p style="color:#1F2937;font-size:16px;margin-top:0">Hi ${name},</p>
    <p style="color:#6B7280;font-size:14px;line-height:1.6">
      Your account has been created successfully. You can now browse thousands of
      verified healthcare job opportunities and apply in seconds.
    </p>
    <div style="text-align:center;margin-top:24px">
      <a href="${BASE_URL}/jobs"
        style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2F80ED,#2EC4B6);color:white;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px">
        Browse Open Jobs
      </a>
    </div>
  `))
}

type ApplicationNotificationParams = {
  to: string
  toName: string
  candidateName: string
  candidateEmail: string
  candidatePhone?: string | null
  jobTitle: string
  jobLocation: string
  appliedAt: Date
  dashboardLink: string
  isAdmin?: boolean
}

export async function sendApplicationNotification(p: ApplicationNotificationParams) {
  const subject = `New Application: ${p.candidateName} applied for ${p.jobTitle}`
  const greeting = p.isAdmin ? "Hi Admin," : `Hi ${p.toName},`
  const intro = p.isAdmin
    ? `A new application has been submitted on GeniePro Healthcare.`
    : `Great news! A candidate has applied for one of your job postings.`

  const html = emailWrapper(`
    <p style="color:#1F2937;font-size:16px;margin-top:0">${greeting}</p>
    <p style="color:#6B7280;font-size:14px;line-height:1.6">${intro}</p>

    <div style="background:#f8faff;border:1px solid #e0eaff;border-radius:12px;padding:20px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#9CA3AF;width:140px">Job Title</td>
            <td style="padding:6px 0;color:#1F2937;font-weight:600">${p.jobTitle}</td></tr>
        <tr><td style="padding:6px 0;color:#9CA3AF">Location</td>
            <td style="padding:6px 0;color:#1F2937">${p.jobLocation}</td></tr>
        <tr><td style="padding:6px 0;color:#9CA3AF">Candidate</td>
            <td style="padding:6px 0;color:#1F2937;font-weight:600">${p.candidateName}</td></tr>
        <tr><td style="padding:6px 0;color:#9CA3AF">Email</td>
            <td style="padding:6px 0"><a href="mailto:${p.candidateEmail}" style="color:#2F80ED">${p.candidateEmail}</a></td></tr>
        ${p.candidatePhone ? `<tr><td style="padding:6px 0;color:#9CA3AF">Phone</td>
            <td style="padding:6px 0;color:#1F2937">${p.candidatePhone}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#9CA3AF">Applied</td>
            <td style="padding:6px 0;color:#1F2937">${p.appliedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td></tr>
      </table>
    </div>

    <div style="text-align:center;margin-top:24px">
      <a href="${p.dashboardLink}"
        style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,#2F80ED,#2EC4B6);color:white;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px">
        View Application →
      </a>
    </div>
  `)

  await send(p.to, subject, html)
}
