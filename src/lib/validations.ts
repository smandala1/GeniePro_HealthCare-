import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["CANDIDATE", "RECRUITER"]),
  company: z.string().optional(),
  profession: z.string().optional(),
  licensedStates: z.array(z.string()).optional(),
  preferredStates: z.array(z.string()).optional(),
  compactLicense: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
})

export const JobPostingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  specialty: z.enum(["NURSING", "ALLIED_HEALTH", "NONCLINICAL", "PHARMA"]),
  subSpecialty: z.string().optional(),
  type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "PER_DIEM", "TRAVEL"]),
  location: z.string().min(2, "Location is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  isRemote: z.boolean().default(false),
  salaryMin: z.number().positive().optional().nullable(),
  salaryMax: z.number().positive().optional().nullable(),
  salaryType: z.enum(["ANNUAL", "HOURLY"]).default("ANNUAL"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  requirements: z.string().min(20, "Requirements must be at least 20 characters"),
  benefits: z.string().optional(),
  shiftType: z.string().optional(),
  experienceRequired: z.number().min(0).optional().nullable(),
  isFeatured: z.boolean().default(false),
})

export const ApplicationSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().max(2000).optional(),
})

export const ApplicationStatusSchema = z.object({
  status: z.enum(["APPLIED","SCREENING","INTERVIEW","OFFER","HIRED","REJECTED","WITHDRAWN"]),
  note: z.string().optional(),
  interviewDate: z.string().optional(),
  offerAmount: z.string().optional(),
  recruiterNotes: z.string().optional(),
})

export const CandidateProfileSchema = z.object({
  specialty: z.string().optional(),
  subSpecialty: z.string().optional(),
  yearsExperience: z.number().min(0).max(50).optional().nullable(),
  location: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().max(1000).optional(),
  availability: z.string().optional(),
  desiredSalary: z.string().optional(),
  linkedInUrl: z.string().url().optional().or(z.literal("")),
  licenseNumber: z.string().optional(),
  licenseState: z.string().optional(),
  skills: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
})

export const MessageSchema = z.object({
  toId: z.string().min(1),
  subject: z.string().optional(),
  content: z.string().min(1, "Message cannot be empty").max(5000),
  parentId: z.string().optional(),
})
