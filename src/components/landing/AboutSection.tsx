export default function AboutSection() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
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
