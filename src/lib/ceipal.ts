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
  const res = await fetch(`${BASE_URL}/createAuthtoken/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, api_key: API_KEY, json: 1 }),
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.text().catch(() => res.status.toString())
    throw new Error(`Ceipal authentication failed (${res.status}): ${body}`)
  }

  // Ceipal returns XML: <root><access_token>...</access_token></root>
  const text = await res.text()
  const match = text.match(/<access_token>(.*?)<\/access_token>/)
  if (!match) {
    throw new Error(`Ceipal auth: no access_token in response: ${text.slice(0, 200)}`)
  }

  tokenStore = {
    accessToken:  match[1],
    refreshToken: "",
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

    const text = await res.text()
    const match = text.match(/<access_token>(.*?)<\/access_token>/)
    if (!match) return authenticate()

    tokenStore = {
      ...tokenStore,
      accessToken: match[1],
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

// Returns null for non-healthcare jobs (IT, engineering, etc.) — caller should filter these out.
export function inferSpecialty(title: string, skills?: string): string | null {
  const haystack = `${title} ${skills ?? ""}`.toLowerCase()

  // Healthcare context guard — if present, always treat as healthcare regardless of other signals
  const hasHealthcareContext = /\b(health|medical|clinical|patient|nurs|hospital|pharma|biotech|physician|care\b|rehab)\b/.test(haystack)

  // Exclude pure IT/tech jobs that have no healthcare context
  const isIT = /\b(software\s*(developer|engineer|architect)|web\s*(developer|engineer)|mobile\s*(developer|engineer)|devops|cloud\s*(engineer|architect)|data\s*(engineer|scientist)|machine\s*learning|artificial\s*intelligence|frontend|front[\s-]end|backend|back[\s-]end|full[\s-]?stack|javascript|typescript|react\s*developer|angular\s*developer|node\.?js|\.net\s*developer|java\s*developer|php\s*developer|python\s*developer|cybersecurity|network\s*engineer|sysadmin|system\s*admin|it\s*support|help\s*desk|software\s*qa|qa\s*engineer|ui\s*ux|graphic\s*design|jboss|wildfly|weblogic|websphere|tomcat\s*admin|middleware\s*engineer|linux\s*admin|windows\s*admin|database\s*admin|dba\b|oracle\s*dba|sql\s*server\s*dba|infrastructure\s*engineer|platform\s*engineer|site\s*reliability|scrum\s*master|product\s*owner|business\s*analyst(?!\s*(health|medical|clinical)))\b/.test(haystack)

  if (isIT && !hasHealthcareContext) return null

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

// ── Custom jobs endpoint (CEIPAL_JOBS_URL) ────────────────────────────────────
// The custom endpoint returns a different shape than the standard Ceipal API.

const CUSTOM_JOBS_URL = process.env.CEIPAL_JOBS_URL ?? process.env.CEIPAL_API_URL ?? ""
const CUSTOM_AUTH_URL = process.env.CEIPAL_AUTH_URL ?? "https://api.ceipal.com/v1/createAuthtoken/"

export function isCustomJobsConfigured() {
  return Boolean(CUSTOM_JOBS_URL && EMAIL && PASSWORD && API_KEY)
}

let customToken: string | null = null
let customTokenExpiresAt = 0

async function getCustomToken(): Promise<string> {
  if (customToken && Date.now() < customTokenExpiresAt) return customToken
  const res = await fetch(CUSTOM_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD, api_key: API_KEY, json: 1 }),
    cache: "no-store",
  })
  if (!res.ok) throw new Error(`Ceipal auth failed: HTTP ${res.status}`)
  const text = await res.text()
  const match = text.match(/<access_token>(.*?)<\/access_token>/)
  if (!match) throw new Error(`Ceipal auth: no access_token in response`)
  customToken = match[1]
  customTokenExpiresAt = Date.now() + 55 * 60 * 1000
  return customToken
}

export interface RawCustomCeipalJob {
  id: string
  job_title?: string
  public_job_title?: string
  job_type?: string
  employment_type?: string
  city?: string
  states?: string
  country?: string
  pay_rate___salary?: string
  client_bill_rate___salary?: string
  job_description?: string
  public_job_description?: string
  job_status?: string
  primary_skills?: string
  secondary_skills?: string
  experience?: string | number
  number_of_positions?: string | number
  duration?: string
  apply_job?: string
  apply_job_without_registration?: string
  Created?: string
}

function stripHtmlTags(html?: string): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").replace(/&[a-z]+;/gi, " ").trim()
}

export function transformCustomCeipalJob(cj: RawCustomCeipalJob) {
  const title    = cj.public_job_title || cj.job_title || "Untitled Position"
  const skills   = [cj.primary_skills, cj.secondary_skills].filter(Boolean).join(", ")
  const pay      = cj.pay_rate___salary || cj.client_bill_rate___salary || null
  const desc     = cj.public_job_description || cj.job_description || title
  const location = [cj.city, cj.states].filter(Boolean).join(", ") || cj.country || "United States"
  const specialty = inferSpecialty(title, skills)

  return {
    id:           cj.id,
    title,
    specialty:    specialty ?? "NURSING", // null means excluded — caller filters by _excluded flag
    _excluded:    specialty === null,
    type:         mapCeipalType(cj.job_type || cj.employment_type),
    status:       (cj.job_status ?? "").toLowerCase() === "active" ? "ACTIVE" : "CLOSED",
    location,
    city:         cj.city   || null,
    state:        cj.states || null,
    salaryMin:    null,
    salaryMax:    null,
    salaryType:   pay ? "HOURLY" : null,
    payDisplay:   pay ? `$${pay}/hr` : null,
    description:  stripHtmlTags(desc),
    requirements: skills || null,
    benefits:     null,
    isRemote:     false,
    isFeatured:   false,
    isCeipal:     true,
    experienceRequired: cj.experience ? Number(cj.experience) : null,
    postedAt:     cj.Created ? new Date(cj.Created).toISOString() : null,
    viewCount:    0,
    duration:     cj.duration || null,
    openings:     cj.number_of_positions ? Number(cj.number_of_positions) : null,
    applyUrl:     cj.apply_job_without_registration || cj.apply_job || null,
    recruiterProfile: {
      company: "GeniePro Healthcare",
      logoUrl: null,
      city:    cj.city   || null,
      state:   cj.states || null,
      description: null,
    },
    _count: { applications: 0 },
  }
}

export type TransformedCeipalJob = ReturnType<typeof transformCustomCeipalJob>

export async function fetchAllCustomCeipalJobs(): Promise<TransformedCeipalJob[]> {
  const token = await getCustomToken()
  const PAGE_SIZE = 20
  const all: TransformedCeipalJob[] = []
  let page = 1
  let totalPages = 1

  do {
    const url = `${CUSTOM_JOBS_URL}?page=${page}&paging_length=${PAGE_SIZE}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    })
    if (!res.ok) {
      if (res.status === 401) { customToken = null; customTokenExpiresAt = 0 }
      throw new Error(`Ceipal jobs API error: HTTP ${res.status}`)
    }
    const text = await res.text()
    const data = JSON.parse(text.replace(/[\x00-\x1F\x7F]/g, (c) =>
      c === "\n" || c === "\r" || c === "\t" ? c : " "
    )) as { num_pages?: number; results?: RawCustomCeipalJob[] }

    totalPages = data.num_pages ?? 1
    const transformed = (data.results ?? []).map(transformCustomCeipalJob).filter((j) => !j._excluded)
    all.push(...transformed)
    page++
  } while (page <= totalPages && page <= 5)

  return all
}

export async function fetchCustomCeipalJobById(id: string): Promise<TransformedCeipalJob | null> {
  const jobs = await fetchAllCustomCeipalJobs()
  return jobs.find((j) => j.id === id) ?? null
}
