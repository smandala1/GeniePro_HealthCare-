export const SPECIALTIES = [
  { value: "NURSING", label: "Nursing", color: "blue", icon: "Heart" },
  { value: "ALLIED_HEALTH", label: "Allied Health", color: "green", icon: "Activity" },
  { value: "NONCLINICAL", label: "Nonclinical", color: "purple", icon: "Briefcase" },
  { value: "PHARMA", label: "Pharma", color: "orange", icon: "FlaskConical" },
] as const

export const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "PER_DIEM", label: "Per Diem" },
  { value: "TRAVEL", label: "Travel Nurse" },
] as const

export const APPLICATION_STATUSES = [
  { value: "APPLIED",   label: "Applied",   color: "gray",   step: 1 },
  { value: "SCREENING", label: "Screening", color: "blue",   step: 2 },
  { value: "INTERVIEW", label: "Interview", color: "yellow", step: 3 },
  { value: "OFFER",     label: "Offer",     color: "purple", step: 4 },
  { value: "HIRED",     label: "Hired",     color: "green",  step: 5 },
  { value: "REJECTED",  label: "Rejected",  color: "red",    step: 0 },
  { value: "WITHDRAWN", label: "Withdrawn", color: "orange", step: 0 },
] as const

export const CANDIDATE_NAV = [
  { href: "/dashboard/candidate",              label: "Overview",      icon: "LayoutDashboard" },
  { href: "/dashboard/candidate/profile",      label: "My Profile",    icon: "User" },
  { href: "/dashboard/candidate/jobs",         label: "Find Jobs",     icon: "Search" },
  { href: "/dashboard/candidate/applications", label: "Applications",  icon: "FileText" },
  { href: "/dashboard/candidate/saved",        label: "Saved Jobs",    icon: "Bookmark" },
  { href: "/dashboard/candidate/messages",     label: "Messages",      icon: "MessageSquare" },
  { href: "/dashboard/candidate/referrals",    label: "Referrals",     icon: "Users" },
  { href: "/dashboard/candidate/settings",     label: "Settings",      icon: "Settings" },
]

export const RECRUITER_NAV = [
  { href: "/dashboard/recruiter",              label: "Overview",      icon: "LayoutDashboard" },
  { href: "/dashboard/recruiter/jobs",         label: "Job Postings",  icon: "Briefcase" },
  { href: "/dashboard/recruiter/pipeline",     label: "Pipeline",      icon: "Kanban" },
  { href: "/dashboard/recruiter/candidates",   label: "Candidates",    icon: "Users" },
  { href: "/dashboard/recruiter/messages",     label: "Messages",      icon: "MessageSquare" },
  { href: "/dashboard/recruiter/company",      label: "Company",       icon: "Building2" },
  { href: "/dashboard/recruiter/settings",     label: "Settings",      icon: "Settings" },
]

export const ADMIN_NAV = [
  { href: "/dashboard/admin",             label: "Overview",    icon: "LayoutDashboard" },
  { href: "/dashboard/admin/users",       label: "Users",       icon: "Users" },
  { href: "/dashboard/admin/jobs",        label: "Jobs",        icon: "Briefcase" },
  { href: "/dashboard/admin/recruiters",  label: "Recruiters",  icon: "Building2" },
  { href: "/dashboard/admin/candidates",  label: "Candidates",  icon: "UserCheck" },
  { href: "/dashboard/admin/analytics",   label: "Analytics",   icon: "BarChart3" },
  { href: "/dashboard/admin/content",     label: "Content",     icon: "FileEdit" },
  { href: "/dashboard/admin/reviews",       label: "Reviews",      icon: "Star" },
  { href: "/dashboard/admin/integrations", label: "Integrations", icon: "Link2" },
  { href: "/dashboard/admin/settings",     label: "Settings",     icon: "Settings" },
]

export const AVAILABILITY_OPTIONS = [
  { value: "IMMEDIATELY", label: "Immediately" },
  { value: "2_WEEKS",     label: "2 Weeks" },
  { value: "1_MONTH",     label: "1 Month" },
  { value: "OPEN",        label: "Open to Discuss" },
]

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK",
  "OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
]
