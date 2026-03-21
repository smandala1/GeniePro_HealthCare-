export type UserRole = "ADMIN" | "RECRUITER" | "CANDIDATE"
export type Specialty = "NURSING" | "ALLIED_HEALTH" | "NONCLINICAL" | "PHARMA"
export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "PER_DIEM" | "TRAVEL"
export type JobStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "CLOSED"
export type AppStatus = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED" | "WITHDRAWN"

export interface NavItem {
  href: string
  label: string
  icon: string
}
