import { Metadata } from "next"
import Link from "next/link"
import {
  CheckCircle2, Briefcase, Bell, MessageSquare,
  FileText, Shield, Star, ArrowRight, Mail,
  Zap, BarChart3, ClipboardList,
} from "lucide-react"

export const metadata: Metadata = {
  title: "For Employers & Staffing Agencies | GeniePro Healthcare",
  description:
    "Post healthcare jobs for free and connect with thousands of verified nurses, allied health professionals, and clinical staff across the US. GeniePro Healthcare is built exclusively for healthcare hiring.",
}

const STATS = [
  { value: "10,000+", label: "Healthcare Professionals" },
  { value: "4",       label: "Core Specialties" },
  { value: "50",      label: "States Covered" },
  { value: "Free",    label: "To Post a Job" },
]

const STEPS = [
  {
    step: "01",
    icon: Briefcase,
    title: "Create your recruiter profile",
    desc: "Set up your company page in minutes. Add your logo, locations, and specialties — no setup fee, no contract.",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Post jobs & receive applications",
    desc: "Build detailed job listings with salary ranges, shift types, and license requirements. Candidates apply directly on the platform.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Manage your pipeline & hire",
    desc: "Move candidates through your pipeline, schedule interviews, send offers, and track every applicant in one place.",
  },
]

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Healthcare Professionals",
    desc: "Every candidate profile includes their specialty, license states, years of experience, and uploaded certifications — no guesswork.",
  },
  {
    icon: Bell,
    title: "Instant Application Alerts",
    desc: "Get notified by email and in-app the moment a candidate applies — with their name, resume, and contact info in one click.",
  },
  {
    icon: BarChart3,
    title: "Full Applicant Pipeline",
    desc: "A visual Kanban-style pipeline to move candidates from Applied → Screening → Interview → Offer → Hired without losing track of anyone.",
  },
  {
    icon: MessageSquare,
    title: "Direct Candidate Messaging",
    desc: "Message candidates directly within the platform. No lost emails, no spreadsheets — all conversations in one thread.",
  },
  {
    icon: FileText,
    title: "Resume & Certificate Collection",
    desc: "Candidates upload their resume and nursing licenses, BLS/ACLS certs, and specialty credentials at apply time. Always attached, always accessible.",
  },
  {
    icon: Zap,
    title: "Job Expiry & Status Control",
    desc: "Set expiry dates on listings so your pipeline stays fresh. Publish, pause, or close jobs instantly from your dashboard.",
  },
]

const REASONS = [
  "Built exclusively for healthcare — no software engineer or IT roles cluttering your feed",
  "Candidates self-identify their license states, compact license status, and specialty",
  "Salary ranges and shift types shown upfront — attracting serious, qualified applicants",
  "No subscription required — post your first job free",
  "Real-time notifications so you never miss a strong candidate",
  "HIPAA-aware design and secure document storage",
]

export default function ForEmployersPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-black text-lg">
            <span style={{ color: "#2F80ED" }}>Genie</span>
            <span style={{ color: "#2EC4B6" }}>Pro</span>
            <span className="text-gray-500 text-sm font-normal ml-1">Healthcare</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors">
              Sign In
            </Link>
            <Link
              href="/auth/register?role=RECRUITER"
              className="text-sm font-semibold text-white px-4 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}
            >
              Post a Job Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: "#0f1f38" }} className="relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#2EC4B6,transparent)" }} />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle,#2F80ED,transparent)" }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32 text-center">
          <p className="text-xs font-bold tracking-widest uppercase mb-4" style={{ color: "#2EC4B6" }}>
            For Employers &amp; Staffing Agencies
          </p>
          <h1 className="text-4xl lg:text-6xl font-black text-white leading-tight mb-6">
            Find Top Healthcare Talent,{" "}
            <span style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Faster.
            </span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            GeniePro Healthcare connects you with thousands of verified nurses, allied health professionals,
            and clinical staff across all 50 states — built exclusively for healthcare hiring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=RECRUITER"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}
            >
              Post a Job Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:hiring@genieprohealthcare.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border border-white/20 text-white/80 hover:border-white/40 hover:text-white transition-all"
            >
              <Mail className="h-4 w-4" /> Talk to Our Team
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl font-black" style={{ color: "#2F80ED" }}>{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#2EC4B6" }}>Simple Process</p>
            <h2 className="text-3xl font-black text-gray-900">How it works</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">From signup to first hire in days — not weeks.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative">
                <span className="absolute top-6 right-6 text-5xl font-black text-gray-50 select-none leading-none">{step}</span>
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "linear-gradient(135deg,#2F80ED22,#2EC4B622)" }}>
                  <Icon className="h-6 w-6" style={{ color: "#2F80ED" }} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#2EC4B6" }}>Platform Features</p>
            <h2 className="text-3xl font-black text-gray-900">Everything you need to hire healthcare talent</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg,#EFF6FF,#F0FDFA)" }}>
                  <Icon className="h-5 w-5" style={{ color: "#2F80ED" }} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why GeniePro ── */}
      <section style={{ background: "#0f1f38" }} className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2EC4B6" }}>Why GeniePro</p>
              <h2 className="text-3xl font-black text-white mb-5">Built for healthcare hiring — not generic job boards</h2>
              <p className="text-white/60 leading-relaxed mb-8">
                Generic job boards bury your healthcare listings under hundreds of unrelated IT and corporate roles.
                GeniePro is healthcare-only — every candidate, every job, every search is specific to your specialty.
              </p>
              <Link
                href="/auth/register?role=RECRUITER"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#2EC4B6" }} />
                  <span className="text-white/70 text-sm leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Testimonial placeholder ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Star className="h-8 w-8 mx-auto mb-6" style={{ color: "#2EC4B6" }} />
          <blockquote className="text-2xl font-bold text-gray-900 leading-snug mb-5">
            &ldquo;GeniePro made it easy to find qualified travel nurses fast. The pipeline view alone saved our team hours every week.&rdquo;
          </blockquote>
          <p className="text-sm text-gray-400">Staffing Director, Atlanta, GA</p>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-24" style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to find your next hire?</h2>
          <p className="text-white/80 mb-10 text-lg">Create your free recruiter account and post your first job in under 5 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=RECRUITER"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full font-bold text-sm transition-all hover:shadow-lg"
              style={{ color: "#2F80ED" }}
            >
              Post a Job Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border-2 border-white/40 text-white hover:border-white hover:bg-white/10 transition-all"
            >
              Sign In to Your Account
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact footer ── */}
      <section className="py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center sm:text-left">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Email</p>
              <a href="mailto:hiring@genieprohealthcare.com" className="text-sm font-semibold hover:underline" style={{ color: "#2F80ED" }}>
                hiring@genieprohealthcare.com
              </a>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Phone</p>
              <a href="tel:+14702972727" className="text-sm font-semibold text-gray-800 hover:underline">
                (470) 297-2727
              </a>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2">Office</p>
              <p className="text-sm text-gray-500">925 North Point Pkwy. Ste 130, Alpharetta, GA 30005</p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>© {new Date().getFullYear()} GeniePro Healthcare. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/jobs" className="hover:text-gray-600 transition-colors">Browse Jobs</Link>
              <Link href="/about" className="hover:text-gray-600 transition-colors">About</Link>
              <Link href="/auth/register" className="hover:text-gray-600 transition-colors">For Candidates</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
