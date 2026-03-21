import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "MMM d, yyyy")
}

export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatSalary(min?: number | null, max?: number | null, type = "ANNUAL") {
  if (!min && !max) return "Salary not disclosed"
  const suffix = type === "HOURLY" ? "/hr" : "/yr"
  const fmt = (n: number) => `$${n.toLocaleString()}`
  if (min && max) return `${fmt(min)} - ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  return `Up to ${fmt(max!)}${suffix}`
}

export function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

export function calculateProfileCompleteness(profile: {
  specialty?: string | null
  location?: string | null
  yearsExperience?: number | null
  resumeUrl?: string | null
  bio?: string | null
  licenseNumber?: string | null
  phone?: string | null
  skills?: string
}) {
  const fields = [
    profile.specialty,
    profile.location,
    profile.yearsExperience,
    profile.resumeUrl,
    profile.bio,
    profile.licenseNumber,
    profile.phone,
    profile.skills && JSON.parse(profile.skills).length > 0 ? true : null,
  ]
  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
}
