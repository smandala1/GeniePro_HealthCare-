"use client"

import { useState } from "react"
import Link from "next/link"
import EmployerModal from "@/components/EmployerModal"

export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
    <section className="relative bg-white overflow-hidden">

      {/* ── Purely decorative background layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true" style={{ zIndex: 0 }}>

        {/* Blob 1 — large teal orb, top-right */}
        <div
          className="gp-float absolute rounded-full"
          style={{
            width: "580px", height: "580px",
            top: "-160px", right: "-160px",
            background: "radial-gradient(circle, rgba(46,196,182,0.20) 0%, transparent 70%)",
            filter: "blur(52px)",
          }}
        />

        {/* Blob 2 — blue orb, bottom-left */}
        <div
          className="gp-float-alt absolute rounded-full"
          style={{
            width: "440px", height: "440px",
            bottom: "-110px", left: "-110px",
            background: "radial-gradient(circle, rgba(47,128,237,0.16) 0%, transparent 70%)",
            filter: "blur(56px)",
          }}
        />

        {/* Blob 3 — small cyan accent, center-left */}
        <div
          className="gp-pulse-blob absolute rounded-full"
          style={{
            width: "260px", height: "260px",
            top: "38%", left: "7%",
            background: "radial-gradient(circle, rgba(86,204,242,0.14) 0%, transparent 70%)",
            filter: "blur(38px)",
          }}
        />

        {/* Dot grid pattern */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-dots-pattern" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="#2EC4B6" opacity="0.20" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-dots-pattern)" />
        </svg>

        {/* Geometric double-ring — top-left */}
        <svg
          className="absolute"
          style={{ top: "48px", left: "1%", opacity: 0.10 }}
          width="130" height="130" viewBox="0 0 130 130"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="65" cy="65" r="62" fill="none" stroke="#2F80ED" strokeWidth="2" />
          <circle cx="65" cy="65" r="44" fill="none" stroke="#2EC4B6" strokeWidth="1.2" strokeDasharray="5 7" />
        </svg>

        {/* Geometric spinning dashed ring — mid-right */}
        <svg
          className="gp-spin-slow absolute"
          style={{ top: "32%", right: "3%", opacity: 0.07, transformOrigin: "40px 40px" }}
          width="80" height="80" viewBox="0 0 80 80"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="40" cy="40" r="37" fill="none" stroke="#2EC4B6" strokeWidth="2" strokeDasharray="4 6" />
        </svg>

        {/* Plus icon — upper center */}
        <svg className="absolute" style={{ top: "16%", left: "37%", opacity: 0.16 }} width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — lower center */}
        <svg className="absolute" style={{ top: "74%", left: "50%", opacity: 0.18 }} width="13" height="13" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — top-right area */}
        <svg className="absolute" style={{ top: "9%", right: "26%", opacity: 0.20 }} width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#56CCF2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#56CCF2" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — left side */}
        <svg className="absolute" style={{ top: "58%", left: "3%", opacity: 0.13 }} width="11" height="11" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Decorative wavy stroke lines at the bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 72"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ height: "72px", opacity: 0.10 }}
        >
          <defs>
            <linearGradient id="hero-wave-grad" x1="0" y1="0" x2="1440" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#2F80ED" />
              <stop offset="50%"  stopColor="#2EC4B6" />
              <stop offset="100%" stopColor="#56CCF2" />
            </linearGradient>
          </defs>
          <path d="M0,36 C180,72 360,0 540,36 C720,72 900,0 1080,36 C1260,72 1380,20 1440,36"
            fill="none" stroke="url(#hero-wave-grad)" strokeWidth="2.5" />
          <path d="M0,52 C180,88 360,16 540,52 C720,88 900,16 1080,52 C1260,88 1380,36 1440,52"
            fill="none" stroke="url(#hero-wave-grad)" strokeWidth="1.5" opacity="0.55" />
        </svg>

      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-6 py-20" style={{ zIndex: 1 }}>

        {/* ── Left ── */}
        <div className="space-y-6">

          {/* Badge */}
          <span
            className="inline-block text-sm font-semibold px-4 py-1 rounded-full border"
            style={{
              background: "#EFF9F8",
              color: "#2EC4B6",
              borderColor: "rgba(46,196,182,0.35)",
            }}
          >
            Trusted Healthcare Staffing Partner
          </span>

          {/* Headline */}
          <h1
            className="text-5xl font-black leading-[1.08] tracking-tight"
            style={{ color: "#1F2937" }}
          >
            Find Your Next<br />
            Healthcare Career<br />
            Right Here
          </h1>

          {/* Subtext */}
          <p className="text-gray-500 text-lg leading-relaxed max-w-md">
            Connecting nurses, allied health, and medical professionals with
            top healthcare facilities across the US.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/jobs"
              className="btn-gradient px-8 py-4 rounded-full text-sm font-semibold"
            >
              Browse Open Jobs
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-outline px-8 py-4 rounded-full text-sm"
            >
              I&apos;m an Employer
            </button>
          </div>
        </div>

        {/* ── Right: Layered image design ── */}
        <div className="relative w-full flex items-center justify-center" style={{ height: "580px" }}>

          {/* Layer 1 — Teal block top-right */}
          <div
            className="absolute"
            style={{
              top: 0,
              right: 0,
              width: "75%",
              height: "65%",
              background: "#CCF0EC",
              borderRadius: "0 24px 0 80px",
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {/* Layer 2 — Cream block bottom-left */}
          <div
            className="absolute"
            style={{
              bottom: 0,
              left: 0,
              width: "70%",
              height: "55%",
              background: "#F5EFE6",
              borderRadius: "80px 0 24px 0",
              zIndex: 0,
            }}
            aria-hidden="true"
          />

          {/* Layer 3 — Main image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Home_New_photo.webp"
            alt="Healthcare professional"
            className="absolute object-cover object-top"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-40%, -50%)",
              width: "65%",
              height: "85%",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              zIndex: 1,
            }}
          />

          {/* Layer 4 — Floating card bottom-left */}
          <div
            className="absolute"
            style={{
              bottom: "40px",
              left: 0,
              zIndex: 2,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(31,41,55,0.12)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <p className="font-bold text-gray-900 text-base">100% Verified Roles</p>
            <p className="text-sm text-gray-500 mt-1">No redirects, ever.</p>
          </div>

          {/* Layer 5 — Floating card top-right */}
          <div
            className="absolute flex items-center"
            style={{
              top: "30px",
              right: 0,
              zIndex: 2,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.6)",
              boxShadow: "0 8px 32px rgba(31,41,55,0.12)",
              borderRadius: "16px",
              padding: "16px 20px",
            }}
          >
            <span
              className="inline-block rounded-full shrink-0 animate-pulse"
              style={{ width: "8px", height: "8px", background: "#2EC4B6", marginRight: "8px" }}
            />
            <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
              New jobs added Everyday
            </p>
          </div>

        </div>

      </div>
    </section>

    <EmployerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
