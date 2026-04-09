export default function AboutSection() {
  return (
    <section id="about" className="relative bg-white py-24 overflow-hidden">

      {/* ── Purely decorative background layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true" style={{ zIndex: 0 }}>

        {/* Radial gradient wash — centered depth */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px", height: "600px",
          background: "radial-gradient(ellipse, rgba(47,128,237,0.06) 0%, transparent 68%)",
          filter: "blur(24px)",
        }} />

        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="about-dots-pattern" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.4" fill="#2F80ED" opacity="0.11" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-dots-pattern)" />
        </svg>

        {/* Dashed arc ring — bottom-right */}
        <svg className="absolute" style={{ bottom: "-20px", right: "-20px", opacity: 0.07 }} width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="94" fill="none" stroke="#2EC4B6" strokeWidth="2" strokeDasharray="6 8" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#2F80ED" strokeWidth="1.2" strokeDasharray="4 9" />
        </svg>

        {/* Plus icon — top-right */}
        <svg className="absolute" style={{ top: "22%", right: "7%", opacity: 0.15 }} width="15" height="15" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — bottom-left */}
        <svg className="absolute" style={{ bottom: "22%", left: "5%", opacity: 0.13 }} width="18" height="18" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Small teal blob — left-center */}
        <div
          className="gp-float absolute rounded-full"
          style={{
            width: "280px", height: "280px",
            top: "20%", left: "-80px",
            background: "radial-gradient(circle, rgba(46,196,182,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

      </div>

      <div className="relative max-w-7xl mx-auto px-6" style={{ zIndex: 1 }}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-2"
              style={{ color: "#2EC4B6" }}
            >
              About Us
            </p>
            <h2
              className="text-3xl font-black mt-2 mb-6 leading-tight"
              style={{ color: "#1F2937" }}
            >
              Connecting Healthcare Talent with Opportunity
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
          </div>

          {/* Right — vision & mission cards */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#EBF3FB] rounded-xl p-5 border-l-4 border-[#2F80ED]">
              <p className="font-bold text-[#2F80ED] text-base mb-2">Vision</p>
              <p className="text-[#1F2937] text-sm leading-relaxed">
                To be the most trusted healthcare staffing partner — delivering speed, quality, and compliance on every placement.
              </p>
            </div>
            <div className="bg-[#EBF3FB] rounded-xl p-5 border-l-4 border-[#2EC4B6]">
              <p className="font-bold text-[#2EC4B6] text-base mb-2">Mission</p>
              <p className="text-[#1F2937] text-sm leading-relaxed">
                To eliminate friction in healthcare hiring by connecting the right professionals with the right facilities — faster than anyone else.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
