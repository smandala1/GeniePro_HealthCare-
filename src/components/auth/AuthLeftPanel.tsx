"use client"

import Image from "next/image"

interface AuthLeftPanelProps {
  role: "CANDIDATE" | "RECRUITER"
  variant: "login" | "register"
}

export function AuthLeftPanel({ role, variant }: AuthLeftPanelProps) {
  const taglines = {
    login: {
      CANDIDATE: {
        title: "Your next healthcare career starts here.",
        sub: "Nursing, Allied Health, Nonclinical, and Pharma roles across the US.",
      },
      RECRUITER: {
        title: "Place the right candidates, faster.",
        sub: "Post jobs, manage applications, and build your healthcare team.",
      },
    },
    register: {
      CANDIDATE: {
        title: "Join thousands of healthcare professionals.",
        sub: "Browse and apply to verified positions — no redirects, ever.",
      },
      RECRUITER: {
        title: "Find the talent your facility needs.",
        sub: "Post jobs, manage your pipeline, and connect with top candidates.",
      },
    },
  }

  const { title, sub } = taglines[variant][role]

  const badges =
    role === "CANDIDATE"
      ? {
          top: { title: "<30 Seconds", sub: "Quick Apply" },
          bottom: { title: "100% Verified", sub: "Credentialed Roles" },
        }
      : {
          top: { title: "48h Avg. Fill", sub: "Time to Hire" },
          bottom: { title: "Pre-Screened", sub: "Candidate Profiles" },
        }

  return (
    <div
      className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
      style={{ background: "linear-gradient(150deg, #dbeafe 0%, #bfdbfe 60%, #c7d2fe 100%)" }}
    >
      {/* Right wave blending into white form panel */}
      <svg
        className="absolute top-0 right-0 h-full w-32 pointer-events-none"
        viewBox="0 0 130 800"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M130 0 C70 200, 100 400, 65 580 C40 700, 90 760, 130 800 Z" fill="white" />
      </svg>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      <Image
        src="/GeniePro Health.png"
        alt="GeniePro Healthcare"
        width={300}
        height={250}
        className="relative z-10"
        style={{ mixBlendMode: "multiply", objectFit: "contain" }}
      />

      {/* Center: stat cards */}
      <div className="relative z-10 flex-1 flex flex-col items-start justify-center gap-5 py-8">
        {/* Stat card 1 */}
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-4 w-full max-w-xs"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 4px 24px rgba(99,120,220,0.10)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(219,234,254,0.7)" }}
          >
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{badges.top.title}</p>
            <p className="text-sm text-gray-500">{badges.top.sub}</p>
          </div>
        </div>

        {/* Stat card 2 */}
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-4 w-full max-w-xs self-end"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 4px 24px rgba(99,120,220,0.10)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(219,234,254,0.7)" }}
          >
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{badges.bottom.title}</p>
            <p className="text-sm text-gray-500">{badges.bottom.sub}</p>
          </div>
        </div>

        {/* Stat card 3 */}
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-4 w-full max-w-xs"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: "0 4px 24px rgba(99,120,220,0.10)",
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(219,234,254,0.7)" }}
          >
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {role === "CANDIDATE" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              )}
            </svg>
          </div>
          <div>
            {role === "CANDIDATE" ? (
              <>
                <p className="text-base font-bold text-gray-900">5,000+ Open Roles</p>
                <p className="text-sm text-gray-500">Across 4 specialties</p>
              </>
            ) : (
              <>
                <p className="text-base font-bold text-gray-900">Kanban Pipeline</p>
                <p className="text-sm text-gray-500">Manage applicants easily</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="relative z-10">
        <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{sub}</p>
      </div>
    </div>
  )
}
