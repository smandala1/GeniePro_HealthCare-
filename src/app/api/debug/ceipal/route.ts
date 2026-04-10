import { NextResponse } from "next/server"

export async function GET() {
  const CEIPAL_AUTH_URL = process.env.CEIPAL_AUTH_URL ?? "https://api.ceipal.com/v1/createAuthtoken/"
  const CEIPAL_JOBS_URL = process.env.CEIPAL_JOBS_URL ?? process.env.CEIPAL_API_URL ?? ""
  const CEIPAL_USERNAME = process.env.CEIPAL_USERNAME ?? ""
  const CEIPAL_PASSWORD = process.env.CEIPAL_PASSWORD ?? ""
  const CEIPAL_API_KEY  = process.env.CEIPAL_API_KEY  ?? ""

  const configured = Boolean(CEIPAL_JOBS_URL && CEIPAL_USERNAME && CEIPAL_PASSWORD && CEIPAL_API_KEY)

  // Try auth
  let authResult = "not attempted"
  let token = ""
  if (configured) {
    try {
      const res = await fetch(CEIPAL_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: CEIPAL_USERNAME, password: CEIPAL_PASSWORD, api_key: CEIPAL_API_KEY, json: 1 }),
        cache: "no-store",
      })
      const text = await res.text()
      const match = text.match(/<access_token>(.*?)<\/access_token>/)
      if (match) {
        token = match[1].slice(0, 10) + "..."
        authResult = `OK (HTTP ${res.status})`
      } else {
        authResult = `Failed — response: ${text.slice(0, 200)}`
      }
    } catch (e) {
      authResult = `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  // Try jobs fetch
  let jobsResult = "not attempted"
  if (token) {
    try {
      const url = `${CEIPAL_JOBS_URL}?page=1&paging_length=5`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token.replace("...", "")}`, Accept: "application/json" },
        cache: "no-store",
      })
      const text = await res.text()
      jobsResult = `HTTP ${res.status} — body preview: ${text.slice(0, 300)}`
    } catch (e) {
      jobsResult = `Error: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  return NextResponse.json({
    configured,
    env: {
      CEIPAL_AUTH_URL,
      CEIPAL_JOBS_URL: CEIPAL_JOBS_URL ? CEIPAL_JOBS_URL.slice(0, 60) + "..." : "(empty)",
      CEIPAL_USERNAME: CEIPAL_USERNAME ? CEIPAL_USERNAME.slice(0, 5) + "***" : "(empty)",
      CEIPAL_PASSWORD: CEIPAL_PASSWORD ? "***set***" : "(empty)",
      CEIPAL_API_KEY:  CEIPAL_API_KEY  ? "***set***" : "(empty)",
    },
    authResult,
    tokenPreview: token || "(none)",
    jobsResult,
  })
}
