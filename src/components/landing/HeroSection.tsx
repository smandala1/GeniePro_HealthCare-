"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import EmployerModal from "@/components/EmployerModal"

export default function HeroSection() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
    <section className="bg-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-6 py-20">

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
            Trusted Healthcare Staffing
          </span>

          {/* Headline */}
          <h1
            className="text-5xl font-black leading-[1.08] tracking-tight"
            style={{ color: "#1F2937" }}
          >
            Find Your Next<br />
            Healthcare Career<br />
            Opportunity
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

          {/* Trust Stats */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-500 mt-2">
            <span>5,000+ Open Roles</span>
            <span className="text-gray-300 select-none hidden sm:inline">|</span>
            <span>2,000+ Placements</span>
            <span className="text-gray-300 select-none hidden sm:inline">|</span>
            <span>48h Avg. Fill Time</span>
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
          <Image
            src="/Home_New_photo.webp"
            alt="Healthcare professional"
            width={800}
            height={600}
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
              12 new jobs added today
            </p>
          </div>

        </div>

      </div>
    </section>

    <EmployerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
