import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/landing/Navbar"

export const metadata: Metadata = {
  title: "About Us | GeniePro Healthcare",
  description:
    "Learn about GeniePro Healthcare — our mission, values, and why we built a better healthcare staffing platform.",
}

const VALUES = [
  {
    title: "Speed",
    desc: "Apply in under 30 seconds. No repeated resume uploads, no redirects, no waiting rooms.",
    color: "#2F80ED",
    bg: "#EBF3FB",
  },
  {
    title: "Trust",
    desc: "Every role is 100% verified before it appears on our platform. What you see is what you get.",
    color: "#2EC4B6",
    bg: "#EFF9F8",
  },
  {
    title: "Compliance",
    desc: "We operate within strict healthcare staffing regulations so facilities and candidates are always protected.",
    color: "#2F80ED",
    bg: "#EBF3FB",
  },
  {
    title: "Transparency",
    desc: "Salary ranges, schedule types, and facility details upfront — no surprises after the interview.",
    color: "#2EC4B6",
    bg: "#EFF9F8",
  },
]

const SPECIALTIES = [
  { label: "Nursing",       desc: "ICU, OR, Travel RN, L&D, ER and more" },
  { label: "Allied Health", desc: "PT, OT, Radiology, Lab, Respiratory & more" },
  { label: "Nonclinical",   desc: "Admin, coding, HIM & compliance" },
  { label: "Pharma",        desc: "Clinical trials, regulatory affairs & MSL" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section className="relative bg-white overflow-hidden py-20 border-b border-gray-100">
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
              <pattern id="about-page-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.4" fill="#2EC4B6" opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-page-dots)" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center" style={{ zIndex: 1 }}>
          <span
            className="inline-block text-sm font-semibold px-4 py-1 rounded-full border mb-6"
            style={{ background: "#EFF9F8", color: "#2EC4B6", borderColor: "rgba(46,196,182,0.35)" }}
          >
            Our Story
          </span>
          <h1
            className="text-5xl font-black leading-[1.08] tracking-tight mb-6"
            style={{ color: "#1F2937" }}
          >
            Built for Healthcare.<br />Designed for Speed.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
            GeniePro Healthcare is a modern staffing platform built specifically for nurses,
            allied health workers, nonclinical staff, and pharma professionals — connecting
            them directly with verified facilities across the United States.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
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
        <div className="relative max-w-7xl mx-auto px-6" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2EC4B6" }}>
                About Us
              </p>
              <h2 className="text-3xl font-black mt-2 mb-6 leading-tight" style={{ color: "#1F2937" }}>
                Connecting Healthcare Talent<br />with Opportunity
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                GeniePro Healthcare is a modern staffing platform built specifically
                for healthcare professionals. We connect qualified nurses, allied health
                workers, nonclinical staff, and pharma professionals with top-tier
                healthcare facilities across the United States.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Unlike traditional job boards, GeniePro eliminates the middleman.
                Apply directly to verified positions in under 30 seconds — no
                redirects, no repeated resume uploads, no waiting.
              </p>
              <Link
                href="/jobs"
                className="btn-gradient px-7 py-3.5 rounded-full text-sm font-semibold inline-flex items-center"
              >
                Browse Open Roles
              </Link>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">
              <div className="bg-[#EBF3FB] rounded-xl p-6 border-l-4 border-[#2F80ED]">
                <p className="font-bold text-[#2F80ED] text-base mb-2">Vision</p>
                <p className="text-[#1F2937] text-sm leading-relaxed">
                  To be the most trusted healthcare staffing partner — delivering speed, quality,
                  and compliance on every placement.
                </p>
              </div>
              <div className="bg-[#EFF9F8] rounded-xl p-6 border-l-4 border-[#2EC4B6]">
                <p className="font-bold text-[#2EC4B6] text-base mb-2">Mission</p>
                <p className="text-[#1F2937] text-sm leading-relaxed">
                  To eliminate friction in healthcare hiring by connecting the right professionals
                  with the right facilities — faster than anyone else.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2F80ED" }}>
              What We Stand For
            </p>
            <h2 className="text-3xl font-black text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-2xl p-6 border border-gray-100 shadow-sm"
                style={{ background: bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: color }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 8l3.5 3.5L13 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="font-black text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#2EC4B6" }}>
              Coverage
            </p>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Four Specialties. One Platform.</h2>
            <p className="text-gray-500 text-base max-w-md mx-auto">
              We cover the full spectrum of healthcare staffing, from bedside nursing to clinical trials.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SPECIALTIES.map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-200 relative overflow-hidden"
              >
                <div
                  style={{ height: "4px", background: "linear-gradient(90deg, #2F80ED, #2EC4B6)", borderRadius: "8px 8px 0 0" }}
                  className="absolute top-0 left-0 right-0"
                />
                <h3 className="font-black text-gray-900 text-lg mb-2 mt-2">{label}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                <Link
                  href={`/jobs?specialty=${label.toUpperCase().replace(" ", "_")}`}
                  className="mt-4 inline-flex text-sm font-semibold"
                  style={{ color: "#2EC4B6" }}
                >
                  Browse roles →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden py-20" style={{ background: "linear-gradient(135deg, #2F80ED 0%, #2EC4B6 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="about-cta-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1.5" fill="white" opacity="0.08" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#about-cta-dots)" />
          </svg>
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center" style={{ zIndex: 1 }}>
          <h2 className="text-3xl font-black text-white mb-4 leading-tight">
            Ready to Find Your Next Role?
          </h2>
          <p className="text-white/75 text-base mb-8 leading-relaxed">
            Join thousands of healthcare professionals who've already found their next opportunity
            through GeniePro — fast, verified, and without the runaround.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/jobs"
              className="px-8 py-4 rounded-full text-sm font-semibold bg-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
              style={{ color: "#2F80ED" }}
            >
              Browse Open Jobs
            </Link>
            <Link
              href="/auth/register"
              className="px-8 py-4 rounded-full text-sm font-semibold border-2 border-white text-white transition-all duration-200 hover:bg-white/10"
            >
              Create Free Account
            </Link>
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
            <Link href="/auth/login"    className="hover:text-white/70 transition-colors">Sign In</Link>
            <Link href="/auth/register" className="hover:text-white/70 transition-colors">Register</Link>
            <Link href="/jobs"          className="hover:text-white/70 transition-colors">Find Jobs</Link>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
