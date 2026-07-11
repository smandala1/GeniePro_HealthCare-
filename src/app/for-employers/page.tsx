import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/landing/Navbar"
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

      <Navbar />

      {/* ── Hero ── */}
      <section className="relative bg-white overflow-hidden py-20 lg:py-28 border-b border-gray-100">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{
            position: "absolute", top: "-120px", right: "-120px",
            width: "480px", height: "480px",
            background: "radial-gradient(circle, rgba(46,196,182,0.18) 0%, transparent 70%)",
            filter: "blur(50px)",
          }} />
          <div style={{
            position: "absolute", bottom: "-80px", left: "-80px",
            width: "360px", height: "360px",
            background: "radial-gradient(circle, rgba(47,128,237,0.13) 0%, transparent 70%)",
            filter: "blur(44px)",
          }} />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="for-employers-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.4" fill="#2EC4B6" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#for-employers-dots)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center" style={{ zIndex: 1 }}>
          <span
            className="inline-block text-sm font-semibold px-4 py-1 rounded-full border mb-6"
            style={{ background: "#EFF9F8", color: "#2EC4B6", borderColor: "rgba(46,196,182,0.35)" }}
          >
            For Employers &amp; Staffing Agencies
          </span>
          <h1 className="text-4xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6" style={{ color: "#1F2937" }}>
            Find Top Healthcare Talent,{" "}
            <span style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Faster.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            GeniePro Healthcare connects you with thousands of verified nurses, allied health professionals,
            and clinical staff across all 50 states — built exclusively for healthcare hiring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=RECRUITER"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-sm transition-all hover:scale-[1.03] hover:shadow-lg"
              style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}
            >
              Post a Job Free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:hiring@genieprohealthcare.com"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm border-2 border-gray-200 text-gray-600 hover:border-[#2F80ED] hover:text-[#2F80ED] transition-all"
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
      <section className="relative bg-white py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px", height: "500px",
            background: "radial-gradient(ellipse, rgba(47,128,237,0.06) 0%, transparent 68%)",
            filter: "blur(24px)",
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2EC4B6" }}>Why GeniePro</p>
              <h2 className="text-3xl font-black mb-5" style={{ color: "#1F2937" }}>Built for healthcare hiring — not generic job boards</h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                Generic job boards bury your healthcare listings under hundreds of unrelated IT and corporate roles.
                GeniePro is healthcare-only — every candidate, every job, every search is specific to your specialty.
              </p>
              <Link
                href="/auth/register?role=RECRUITER"
                className="btn-gradient inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="space-y-4">
              {REASONS.map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#2EC4B6" }} />
                  <span className="text-gray-600 text-sm leading-relaxed">{r}</span>
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
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center" style={{ zIndex: 1 }}>
          <h2 className="text-3xl font-black text-white mb-4">Ready to find your next hire?</h2>
          <p className="text-white/80 mb-10 text-lg">Create your free recruiter account and post your first job in under 5 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=RECRUITER"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full font-bold text-sm transition-all hover:shadow-lg hover:scale-[1.02]"
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

      {/* ── Contact ── */}
      <section className="py-12 bg-white">
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
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <Image
              src="/GeniePro Health.png"
              alt="GeniePro Healthcare"
              width={120}
              height={40}
              style={{ mixBlendMode: "screen", objectFit: "contain" }}
            />
            <span className="text-sm text-white/40">
              © {new Date().getFullYear()} GeniePro Healthcare · Alpharetta, GA
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/jobs" className="hover:text-white/70 transition-colors">Browse Jobs</Link>
            <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
            <Link href="/auth/register" className="hover:text-white/70 transition-colors">For Candidates</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
