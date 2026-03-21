import Link from "next/link"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import StatsBar from "@/components/landing/StatsBar"
import HowItWorks from "@/components/landing/HowItWorks"
import ReviewsSection from "@/components/landing/ReviewsSection"
import ReferralBanner from "@/components/landing/ReferralBanner"
import SpecialtiesSection from "@/components/landing/SpecialtiesSection"
import CTABanner from "@/components/landing/CTABanner"
import { OpenJobsSection } from "@/components/home/OpenJobsSection"
import AboutSection from "@/components/landing/AboutSection"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      <Navbar />
      <HeroSection />
      <StatsBar />
      <AboutSection />
      <HowItWorks />
      <SpecialtiesSection />
         {/* ── Latest Opportunities ── */}
      {/* OpenJobsSection renders its own header + grid */}
      <OpenJobsSection />
      <ReviewsSection />
      <ReferralBanner />

   

      <CTABanner />

      {/* ── Footer ── */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img
              src="/GeniePro Health.png"
              alt="GeniePro Healthcare"
              style={{
                mixBlendMode: "screen",
                height: "40px",
                width: "auto",
                objectFit: "contain",
              }}
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
