import Link from "next/link"

export default function CTABanner() {
  return (
    <section
      className="py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #2F80ED 0%, #2EC4B6 100%)" }}
    >
      {/* Subtle dot overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl font-black text-white mb-3 leading-tight">
          Ready to take the next step<br className="hidden sm:block" /> in your career?
        </h2>
        <p className="text-white/80 text-base mt-3 mb-8 max-w-lg mx-auto">
          Join thousands of healthcare professionals already building their careers on GeniePro.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/jobs"
            className="flex items-center justify-center px-8 py-3 rounded-full bg-white font-semibold text-sm transition-all duration-200 hover:bg-gray-100 hover:scale-[1.02]"
            style={{ color: "#2F80ED" }}
          >
            Find Jobs
          </Link>
          <Link
            href="/auth/register?role=RECRUITER"
            className="flex items-center justify-center px-8 py-3 rounded-full border-2 border-white text-white font-semibold text-sm transition-all duration-200 hover:bg-white/10"
          >
            Post a Job
          </Link>
        </div>
      </div>
    </section>
  )
}
