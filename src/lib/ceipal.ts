/**
 * Ceipal ATS v1 Service Layer
 * API base: https://api.ceipal.com/v1
 * Docs:     https://developer.ceipal.com/ceipal-ats-version-one
 *
 * Authentication:
 *   POST /createAuthtoken  { email, password, api_key }
 *   → { access_token (1 hr), refresh_token (7 days) }
 *
 * Refresh:
 *   POST /refreshToken/  Header: Token: Bearer {access_token}
 *   → { access_token }
 *
 * All other requests: Authorization: Bearer {access_token}
 */

const BASE_URL  = (process.env.CEIPAL_API_URL ?? "https://api.ceipal.com/v1").replace(/\/$/, "")
const EMAIL     = process.env.CEIPAL_USERNAME  ?? ""
const PASSWORD  = process.env.CEIPAL_PASSWORD  ?? ""
const API_KEY   = process.env.CEIPAL_API_KEY   ?? ""

// ── Token store (module-level singleton) ──────────────────────────────────────

type TokenStore = {
  accessToken:  string
  refreshToken: string
  expiresAt:    number // ms timestamp — 55 min after issue (5 min before 1-hr expiry)
}

let tokenStore: TokenStore | null = null

// ── Auth helpers ──────────────────────────────────────────────────────────────

async function authenticate(): Promise<void> {
  const res = await fetch(`${BASE_URL}/createAuthtoken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, api_key: API_KEY }),
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.text().catch(() => res.status.toString())
    throw new Error(`Ceipal authentication failed (${res.status}): ${body}`)
  }

  const data = await res.json()

  if (!data.access_token) {
    throw new Error("Ceipal auth response missing access_token")
  }

  tokenStore = {
    accessToken:  data.access_token,
    refreshToken: data.refresh_token ?? "",
    expiresAt:    Date.now() + 55 * 60 * 1000, // 55 min
  }
}

async function refreshAuth(): Promise<void> {
  if (!tokenStore?.accessToken) {
    return authenticate()
  }
  try {
    const res = await fetch(`${BASE_URL}/refreshToken/`, {
      method: "POST",
      headers: { Token: `Bearer ${tokenStore.accessToken}` },
      cache: "no-store",
    })
    if (!res.ok) return authenticate()

    const data = await res.json()
    if (!data.access_token) return authenticate()

    tokenStore = {
      ...tokenStore,
      accessToken: data.access_token,
      expiresAt:   Date.now() + 55 * 60 * 1000,
    }
  } catch {
    return authenticate()
  }
}

async function ensureAuth(): Promise<string> {
  if (!tokenStore) {
    await authenticate()
  } else if (Date.now() >= tokenStore.expiresAt) {
    await refreshAuth()
  }
  return tokenStore!.accessToken
}

// ── Generic request ───────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  {
    method = "GET",
    params,
    body,
  }: { method?: string; params?: Record<string, string | undefined>; body?: unknown } = {}
): Promise<T> {
  const token = await ensureAuth()
  const url   = new URL(`${BASE_URL}/${endpoint.replace(/^\//, "")}`)

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v)
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Ceipal API error ${res.status} [${endpoint}]: ${text}`)
  }

  return res.json() as Promise<T>
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type CeipalPayRate = {
  min_rate?: number | string
  max_rate?: number | string
  pay_type?: string
}

export type CeipalJob = {
  id: string
  job_code?: string
  position_title: string
  city?: string
  state?: string
  country?: string
  job_status?: string
  created?: string
  modified?: string
  employment_type?: string
  requisition_description?: string
  skills?: string
  pay_rates?: CeipalPayRate[]
  apply_job?: string
}

export type CeipalJobsResponse = {
  results?: CeipalJob[]
  data?:    CeipalJob[]
  count?:   number
  total?:   number
}

export type CeipalApplicant = {
  id: string
  applicant_id?: string
  firstname: string
  lastname:  string
  email:     string
  mobile_number?: string
  address?:  string
  city?:     string
  state?:    string
  country?:  string
  applicant_status?: string
  skills?:   string
  source?:   string
  resume_path?: string
  created_at?: string
}

export type CeipalApplicantsResponse = {
  results?: CeipalApplicant[]
  data?:    CeipalApplicant[]
  count?:   number
  total?:   number
}

// ── Public API methods ────────────────────────────────────────────────────────

export async function getCeipalJobs(params?: {
  limit?:           string
  job_status?:      string
  searchkey?:       string
  state?:           string
  city?:            string
  JobType?:         string
  posted_ago_days?: string
  modifiedAfter?:   string
}): Promise<CeipalJobsResponse> {
  return request<CeipalJobsResponse>("getJobPostingsList", {
    params: params as Record<string, string>,
  })
}

export async function getCeipalJobDetails(jobId: string): Promise<CeipalJob> {
  return request<CeipalJob>("getJobPostingDetails/", {
    params: { job_id: jobId },
  })
}

export async function getCeipalApplicants(params?: {
  source?:           string
  applicant_status?: string
  sortby?:           string
  sortorder?:        string
  modifiedAfter?:    string
}): Promise<CeipalApplicantsResponse> {
  return request<CeipalApplicantsResponse>("getApplicantsList", {
    params: params as Record<string, string>,
  })
}

export async function getCeipalApplicantDetails(applicantId: string): Promise<CeipalApplicant> {
  return request<CeipalApplicant>("getApplicantDetails/", {
    params: { applicant_id: applicantId },
  })
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

const TYPE_MAP: Record<string, string> = {
  "full time":        "FULL_TIME",
  "fulltime":         "FULL_TIME",
  "full-time":        "FULL_TIME",
  "part time":        "PART_TIME",
  "parttime":         "PART_TIME",
  "part-time":        "PART_TIME",
  "contract":         "CONTRACT",
  "contract-to-hire": "CONTRACT",
  "c2h":              "CONTRACT",
  "per diem":         "PER_DIEM",
  "perdiem":          "PER_DIEM",
  "travel":           "TRAVEL",
  "travel nurse":     "TRAVEL",
}

export function mapCeipalType(employmentType?: string): string {
  if (!employmentType) return "FULL_TIME"
  return TYPE_MAP[employmentType.toLowerCase()] ?? "FULL_TIME"
}

export function mapCeipalStatus(jobStatus?: string): string {
  if (!jobStatus) return "ACTIVE"
  const s = jobStatus.toLowerCase()
  if (s === "open" || s === "active") return "ACTIVE"
  if (s === "closed" || s === "inactive" || s === "expired") return "CLOSED"
  return "ACTIVE"
}

export function inferSpecialty(title: string, skills?: string): string {
  const haystack = `${title} ${skills ?? ""}`.toLowerCase()
  if (/\b(nurs|rn\b|lpn|np\b|cna|icu|er nurse|travel nurse|bls|acls)\b/.test(haystack))
    return "NURSING"
  if (/\b(therapist|therapy|radiolog|sonograph|ultrasound|lab|phlebotom|respiratory|rehab|pt\b|ot\b|slp|imaging)\b/.test(haystack))
    return "ALLIED_HEALTH"
  if (/\b(pharma|pharmacist|drug|clinical trial|clinical research|biotech|regulatory|cra\b|crc\b)\b/.test(haystack))
    return "PHARMA"
  if (/\b(billing|coding|admin|manager|coordinator|recruiter|hr\b|health info|hipaa|ehr|emr|medical record)\b/.test(haystack))
    return "NONCLINICAL"
  return "NURSING"
}

export function extractSalary(payRates?: CeipalPayRate[]): { min: number | null; max: number | null } {
  if (!payRates || payRates.length === 0) return { min: null, max: null }
  const rate = payRates[0]
  const min  = rate.min_rate ? Math.round(Number(rate.min_rate)) : null
  const max  = rate.max_rate ? Math.round(Number(rate.max_rate)) : null
  return { min, max }
}

// ── Feature flag ──────────────────────────────────────────────────────────────

export function isCeipalEnabled(): boolean {
  return Boolean(
    process.env.CEIPAL_USERNAME &&
    process.env.CEIPAL_PASSWORD &&
    process.env.CEIPAL_API_KEY
  )
}

export function isCeipalEnabledClient(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_CEIPAL === "true"
}
