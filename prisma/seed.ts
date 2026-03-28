/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log("Seeding database...")

  const pw = async (plain: string) => bcrypt.hash(plain, 12)

  // ── Admin ─────────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@geniepro.com" },
    update: {},
    create: {
      email: "admin@geniepro.com",
      password: await pw("Admin@123"),
      name: "Admin User",
      role: "ADMIN",
    },
  })

  // ── Recruiters ────────────────────────────────────────────────────────────
  const rec1User = await prisma.user.upsert({
    where: { email: "sarah@mountsinai.com" },
    update: {},
    create: {
      email: "sarah@mountsinai.com",
      password: await pw("Password123!"),
      name: "Sarah Mitchell",
      role: "RECRUITER",
    },
  })
  const rec1 = await prisma.recruiterProfile.upsert({
    where: { userId: rec1User.id },
    update: {},
    create: {
      userId: rec1User.id,
      company: "Mount Sinai Hospital",
      city: "New York",
      state: "NY",
      description:
        "Mount Sinai Hospital is one of the nation's leading academic medical centers, dedicated to patient care, biomedical research, and medical education.",
    },
  })

  const rec2User = await prisma.user.upsert({
    where: { email: "james@geniepro.com" },
    update: {},
    create: {
      email: "james@geniepro.com",
      password: await pw("Password123!"),
      name: "James Carter",
      role: "RECRUITER",
    },
  })
  const rec2 = await prisma.recruiterProfile.upsert({
    where: { userId: rec2User.id },
    update: {},
    create: {
      userId: rec2User.id,
      company: "GeniePro Healthcare",
      city: "Alpharetta",
      state: "GA",
      description:
        "GeniePro Healthcare is a modern staffing platform connecting qualified healthcare professionals with top-tier facilities across the United States.",
    },
  })

  // Legacy recruiters (kept for backwards compatibility)
  const legacyRecruiters = [
    { email: "sarah@atlantichealth.com", name: "Sarah Johnson", company: "Atlantic Health System", city: "Morristown", state: "NJ" },
    { email: "mike@memorialhospital.com", name: "Mike Chen", company: "Memorial Regional Hospital", city: "Hollywood", state: "FL" },
    { email: "lisa@mdhealthcare.com", name: "Lisa Martinez", company: "MedFirst Healthcare", city: "Chicago", state: "IL" },
  ]
  const legacyProfiles: any[] = []
  for (const r of legacyRecruiters) {
    const u = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: { email: r.email, password: await pw("Recruiter@123"), name: r.name, role: "RECRUITER" },
    })
    const p = await prisma.recruiterProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        company: r.company,
        city: r.city,
        state: r.state,
        description: `${r.company} is a leading healthcare organization committed to excellence.`,
      },
    })
    legacyProfiles.push(p)
  }

  // ── Candidates ────────────────────────────────────────────────────────────
  const candUser = await prisma.user.upsert({
    where: { email: "alex@example.com" },
    update: {},
    create: {
      email: "alex@example.com",
      password: await pw("Password123!"),
      name: "Alex Rivera",
      role: "CANDIDATE",
    },
  })
  await prisma.candidateProfile.upsert({
    where: { userId: candUser.id },
    update: {},
    create: {
      userId: candUser.id,
      specialty: "NURSING",
      location: "New York, NY",
      yearsExperience: 4,
      bio: "Experienced ICU Registered Nurse with 4+ years in critical care settings. Passionate about patient outcomes and evidence-based practice.",
      skills: JSON.stringify(["Patient Care", "ACLS", "EMR Systems", "Critical Thinking", "Team Leadership"]),
      certifications: JSON.stringify(["BLS", "ACLS", "CCRN"]),
      availability: "IMMEDIATELY",
    },
  })

  // Legacy candidates
  const legacyCandidates = [
    { email: "jane.doe@email.com", name: "Jane Doe", specialty: "NURSING", location: "Atlanta, GA", exp: 5 },
    { email: "john.smith@email.com", name: "John Smith", specialty: "ALLIED_HEALTH", location: "Dallas, TX", exp: 3 },
    { email: "emily.clark@email.com", name: "Emily Clark", specialty: "PHARMA", location: "Boston, MA", exp: 7 },
    { email: "carlos.reyes@email.com", name: "Carlos Reyes", specialty: "NONCLINICAL", location: "Phoenix, AZ", exp: 4 },
    { email: "priya.patel@email.com", name: "Priya Patel", specialty: "NURSING", location: "Houston, TX", exp: 6 },
  ]
  for (const c of legacyCandidates) {
    const u = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: { email: c.email, password: await pw("Candidate@123"), name: c.name, role: "CANDIDATE" },
    })
    await prisma.candidateProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id,
        specialty: c.specialty,
        location: c.location,
        yearsExperience: c.exp,
        bio: `Experienced healthcare professional with ${c.exp}+ years.`,
        skills: JSON.stringify(["Patient Care", "EMR Systems", "Team Leadership"]),
        certifications: JSON.stringify(["BLS", "ACLS"]),
        availability: "IMMEDIATELY",
      },
    })
  }

  // ── Jobs ──────────────────────────────────────────────────────────────────
  // Clear existing jobs to avoid duplicates on re-seed
  await prisma.applicationStatusHistory.deleteMany()
  await prisma.application.deleteMany()
  await prisma.savedJob.deleteMany()
  await prisma.job.deleteMany()

  const jobs = [
    // ── Recruiter 1 (Sarah Mitchell / Mount Sinai) ──
    {
      title: "Registered Nurse - ICU",
      specialty: "NURSING",
      type: "FULL_TIME",
      location: "New York, NY",
      city: "New York",
      state: "NY",
      salaryMin: 85000,
      salaryMax: 115000,
      description:
        "We are seeking an experienced ICU Registered Nurse to join our critical care team. You will provide direct patient care, monitor vital signs, administer medications, and collaborate with physicians.",
      requirements:
        "BSN required. Minimum 2 years ICU experience. CCRN preferred.\nBLS and ACLS certification required.\nStrong critical thinking and communication skills.",
      benefits:
        "Comprehensive health, dental, and vision insurance\n401(k) with employer match\nGenerous PTO and paid holidays\nTuition reimbursement program",
      isFeatured: true,
      recruiterId: rec1.id,
    },
    {
      title: "Travel Nurse - Emergency Department",
      specialty: "NURSING",
      type: "TRAVEL",
      location: "Rochester, MN",
      city: "Rochester",
      state: "MN",
      salaryMin: 95000,
      salaryMax: 130000,
      description:
        "Join our ER team on a 13-week travel contract. BLS and ACLS required. Housing stipend included.",
      requirements:
        "Active RN license. Compact license preferred.\nMinimum 1 year ED experience.\nBLS and ACLS required.",
      benefits:
        "Weekly pay\nHousing stipend\nTravel reimbursement\nHealth insurance",
      isFeatured: true,
      recruiterId: rec1.id,
    },
    {
      title: "Physical Therapist",
      specialty: "ALLIED_HEALTH",
      type: "FULL_TIME",
      location: "Cleveland, OH",
      city: "Cleveland",
      state: "OH",
      salaryMin: 75000,
      salaryMax: 95000,
      description:
        "Outpatient physical therapy role focused on orthopedic and sports rehabilitation. Flexible scheduling available.",
      requirements:
        "DPT degree required.\nState licensure in Ohio.\nOrthopedic experience preferred.\nStrong patient communication skills.",
      benefits:
        "Full benefits package\nCEU allowance\nFlexible scheduling\nSign-on bonus",
      isFeatured: true,
      recruiterId: rec1.id,
    },
    {
      title: "Radiology Technologist",
      specialty: "ALLIED_HEALTH",
      type: "FULL_TIME",
      location: "Baltimore, MD",
      city: "Baltimore",
      state: "MD",
      salaryMin: 60000,
      salaryMax: 82000,
      description:
        "Perform diagnostic imaging procedures including X-ray, CT, and MRI. ARRT certification required.",
      requirements:
        "ARRT certification required.\nState licensure in Maryland.\nExperience with CT and MRI preferred.",
      benefits:
        "Health and dental insurance\n401(k)\nPaid time off\nContinuing education support",
      isFeatured: true,
      recruiterId: rec1.id,
    },
    {
      title: "Healthcare Recruiter",
      specialty: "NONCLINICAL",
      type: "FULL_TIME",
      location: "Atlanta, GA",
      city: "Atlanta",
      state: "GA",
      salaryMin: 55000,
      salaryMax: 75000,
      description:
        "Source, screen, and place qualified healthcare professionals across multiple facilities in the Southeast region.",
      requirements:
        "2+ years recruiting experience, preferably in healthcare.\nStrong communication and negotiation skills.\nATS proficiency required.",
      benefits:
        "Base salary plus commission\nFull benefits\nRemote flexibility\nCareer growth opportunities",
      isFeatured: false,
      recruiterId: rec1.id,
    },
    {
      title: "Medical Billing Specialist",
      specialty: "NONCLINICAL",
      type: "PART_TIME",
      location: "Dallas, TX",
      city: "Dallas",
      state: "TX",
      salaryMin: 40000,
      salaryMax: 55000,
      description:
        "Process medical claims, manage billing cycles, and ensure accurate coding for outpatient services.",
      requirements:
        "CPC or CCS certification preferred.\n2+ years medical billing experience.\nEMR software proficiency.",
      benefits:
        "Flexible part-time hours\nHealth benefits available\nWork-from-home options",
      isFeatured: false,
      recruiterId: rec1.id,
    },

    // ── Recruiter 2 (James Carter / GeniePro Healthcare) ──
    {
      title: "Clinical Research Coordinator",
      specialty: "PHARMA",
      type: "CONTRACT",
      location: "Boston, MA",
      city: "Boston",
      state: "MA",
      salaryMin: 70000,
      salaryMax: 90000,
      description:
        "Coordinate Phase II-III clinical trials, manage patient recruitment, and maintain regulatory documentation.",
      requirements:
        "Bachelor's degree in life sciences or related field.\n2+ years clinical research experience.\nICH-GCP training required.",
      benefits:
        "Competitive contract rate\nTravel reimbursement\nProfessional development support",
      isFeatured: true,
      recruiterId: rec2.id,
    },
    {
      title: "Pharmacy Technician",
      specialty: "PHARMA",
      type: "FULL_TIME",
      location: "Chicago, IL",
      city: "Chicago",
      state: "IL",
      salaryMin: 45000,
      salaryMax: 60000,
      description:
        "Assist pharmacists in dispensing medications, managing inventory, and providing patient counseling support.",
      requirements:
        "CPhT certification required.\n1+ year hospital pharmacy experience.\nStrong attention to detail.",
      benefits:
        "Health, dental, and vision\n401(k) with match\nTuition assistance",
      isFeatured: false,
      recruiterId: rec2.id,
    },
    {
      title: "Occupational Therapist",
      specialty: "ALLIED_HEALTH",
      type: "FULL_TIME",
      location: "Seattle, WA",
      city: "Seattle",
      state: "WA",
      salaryMin: 78000,
      salaryMax: 98000,
      description:
        "Provide occupational therapy services to patients recovering from injury, illness, or surgery in an inpatient setting.",
      requirements:
        "Master's degree in Occupational Therapy.\nNBCOT certification and WA state license.\n1+ year inpatient experience preferred.",
      benefits:
        "Full benefits\nSign-on bonus\nContinuing education stipend",
      isFeatured: false,
      recruiterId: rec2.id,
    },
    {
      title: "Nurse Practitioner - Primary Care",
      specialty: "NURSING",
      type: "FULL_TIME",
      location: "Phoenix, AZ",
      city: "Phoenix",
      state: "AZ",
      salaryMin: 110000,
      salaryMax: 140000,
      description:
        "Independent NP role in a busy primary care practice. Manage chronic conditions, perform annual exams, and supervise RNs.",
      requirements:
        "MSN or DNP required. Active APRN license in Arizona.\n3+ years NP experience in primary care.\nDEA number preferred.",
      benefits:
        "Malpractice insurance covered\nFull benefits + bonus\nCME allowance\nAutonomy with collaborative support",
      isFeatured: true,
      recruiterId: rec2.id,
    },
    {
      title: "Health Information Manager",
      specialty: "NONCLINICAL",
      type: "FULL_TIME",
      location: "Miami, FL",
      city: "Miami",
      state: "FL",
      salaryMin: 65000,
      salaryMax: 85000,
      description:
        "Oversee medical records, ensure HIPAA compliance, and manage EHR systems for a multi-specialty practice.",
      requirements:
        "RHIA or RHIT certification required.\n3+ years in health information management.\nEpic or Cerner experience preferred.",
      benefits:
        "Competitive salary\nFull benefits\nHybrid work schedule",
      isFeatured: false,
      recruiterId: rec2.id,
    },
    {
      title: "Pharmaceutical Sales Representative",
      specialty: "PHARMA",
      type: "FULL_TIME",
      location: "Los Angeles, CA",
      city: "Los Angeles",
      state: "CA",
      salaryMin: 80000,
      salaryMax: 120000,
      description:
        "Promote and sell pharmaceutical products to healthcare providers across Southern California territory.",
      requirements:
        "Bachelor's degree required. 2+ years pharmaceutical or medical sales.\nEstablished provider relationships preferred.\nValid driver's license.",
      benefits:
        "Base + uncapped commission\nCompany car or car allowance\nFull benefits\nAnnual sales conferences",
      isFeatured: false,
      recruiterId: rec2.id,
    },
  ]

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const postedDaysAgo = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]
  for (let i = 0; i < jobs.length; i++) {
    const postedAt = new Date(now - postedDaysAgo[i % postedDaysAgo.length] * day)
    await prisma.job.create({ data: { ...jobs[i], status: "ACTIVE", postedAt } })
  }

  // ── Reviews ───────────────────────────────────────────────────────────────
  await prisma.review.deleteMany()
  for (const r of [
    {
      name: "Jessica Thompson, RN",
      role: "ICU Nurse, New York, NY",
      rating: 5,
      body: "GeniePro matched me with my dream ICU position in under 48 hours. The platform is intuitive, the recruiter communication is top-notch, and the job listings are 100% verified. I couldn't be happier with my placement.",
      status: "APPROVED",
    },
    {
      name: "Marcus Rivera",
      role: "Physical Therapist, Atlanta, GA",
      rating: 5,
      body: "I had tried three other platforms before GeniePro. Within a week I had two interviews and accepted an offer at a great outpatient clinic. The specialty filters saved me so much time.",
      status: "APPROVED",
    },
    {
      name: "Dr. Priya Nair",
      role: "Clinical Research Associate, Boston, MA",
      rating: 5,
      body: "Finally a platform built specifically for healthcare. The pharma and clinical research listings are genuinely niche and high quality. I found a Phase III coordinator role that wasn't on any other site.",
      status: "APPROVED",
    },
    {
      name: "David Chen",
      role: "Radiology Technologist, Chicago, IL",
      rating: 4,
      body: "Really solid experience overall. The application process was smooth and I appreciated the status updates throughout. Would definitely recommend to any allied health professional.",
      status: "APPROVED",
    },
    {
      name: "Amara Okafor",
      role: "Nurse Practitioner, Phoenix, AZ",
      rating: 5,
      body: "As an NP looking for primary care autonomy, GeniePro had listings I couldn't find elsewhere. Placed within 3 weeks. The team genuinely cares about finding you the right fit, not just any fit.",
      status: "APPROVED",
    },
  ]) {
    await prisma.review.create({ data: r })
  }

  // ── Testimonials ──────────────────────────────────────────────────────────
  await prisma.testimonial.deleteMany()
  for (const t of [
    { name: "Sarah Mitchell, RN", role: "ICU Nurse", company: "Placed at Emory Healthcare", content: "GeniePro matched me with my dream ICU position in under 48 hours. The platform is seamless and the recruiter communication is top-notch.", rating: 5, displayOrder: 1 },
    { name: "James Thornton", role: "Talent Acquisition", company: "HCA Healthcare", content: "As a recruiter, the kanban pipeline alone is worth it. We filled 12 nursing positions in one month — faster than any other platform we've used.", rating: 5, displayOrder: 2 },
    { name: "Dr. Priya Patel", role: "Clinical Research Associate", company: "Pharma", content: "Finally a platform built specifically for healthcare. The specialty filters and direct apply feature saved me weeks of searching.", rating: 5, displayOrder: 3 },
  ]) {
    await prisma.testimonial.create({ data: t })
  }

  console.log("\n✅ Seed complete!")
  console.log("─────────────────────────────────────────────")
  console.log("Admin:       admin@geniepro.com     / Admin@123")
  console.log("Recruiter 1: sarah@mountsinai.com   / Password123!")
  console.log("Recruiter 2: james@geniepro.com     / Password123!")
  console.log("Job Seeker:  alex@example.com       / Password123!")
  console.log("─────────────────────────────────────────────")
  console.log("12 jobs seeded across 4 specialties")
}

main().catch(console.error).finally(() => prisma.$disconnect())
