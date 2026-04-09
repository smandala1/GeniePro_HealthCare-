const STEPS = [
  {
    num: "01",
    title: "Browse Jobs",
    desc: "Search verified roles by specialty, location, and type. Filter by salary, experience, and schedule.",
  },
  {
    num: "02",
    title: "Apply in 30 Seconds",
    desc: "Simple one-click application — no redirects, no uploading the same resume twice.",
  },
  {
    num: "03",
    title: "Get Hired",
    desc: "We match you with the right facility fast. Average time-to-hire is under 48 hours.",
  },
]

export default function HowItWorks() {
  return (
    <section className="relative bg-white py-24 overflow-hidden">

      {/* ── Purely decorative background layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true" style={{ zIndex: 0 }}>

        {/* Soft blue radial wash — top-right */}
        <div style={{
          position: "absolute",
          top: "-60px", right: "-60px",
          width: "500px", height: "400px",
          background: "radial-gradient(ellipse, rgba(47,128,237,0.07) 0%, transparent 70%)",
          filter: "blur(30px)",
        }} />

        {/* Soft teal radial wash — bottom-left */}
        <div style={{
          position: "absolute",
          bottom: "-60px", left: "-40px",
          width: "420px", height: "360px",
          background: "radial-gradient(ellipse, rgba(46,196,182,0.08) 0%, transparent 70%)",
          filter: "blur(28px)",
        }} />

        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hiw-dots-pattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.4" fill="#2F80ED" opacity="0.10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hiw-dots-pattern)" />
        </svg>

        {/* Spinning arc — top-left corner */}
        <svg
          className="gp-spin-slow absolute"
          style={{ top: "-30px", left: "-30px", opacity: 0.06, transformOrigin: "90px 90px" }}
          width="180" height="180" viewBox="0 0 180 180"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="90" cy="90" r="84" fill="none" stroke="#2F80ED" strokeWidth="2" strokeDasharray="8 10" />
        </svg>

        {/* Plus icon — upper-right */}
        <svg className="absolute" style={{ top: "14%", right: "10%", opacity: 0.16 }} width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — lower-left */}
        <svg className="absolute" style={{ bottom: "18%", left: "8%", opacity: 0.14 }} width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — center-bottom */}
        <svg className="absolute" style={{ bottom: "12%", left: "48%", opacity: 0.12 }} width="10" height="10" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#56CCF2" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#56CCF2" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

      </div>

      <div className="relative max-w-7xl mx-auto px-6" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="text-center mb-14">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: "#2EC4B6" }}
          >
            Simple Process
          </p>
          <h2 className="text-3xl font-black text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            Simple, fast, and designed for healthcare professionals.
          </p>
        </div>

        {/* Step cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(({ num, title, desc }) => (
            <div
              key={num}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Gradient top bar */}
              <div
                style={{
                  height: "4px",
                  background: "linear-gradient(90deg, #2F80ED, #2EC4B6)",
                  borderRadius: "8px 8px 0 0",
                }}
              />

              <div className="p-8 relative">
                {/* Gradient decorative number */}
                <span
                  className="absolute top-4 right-4 text-8xl font-black select-none pointer-events-none leading-none"
                  style={{
                    background: "linear-gradient(135deg, #2F80ED, #2EC4B6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    opacity: 0.15,
                  }}
                  aria-hidden="true"
                >
                  {num}
                </span>

                {/* Step label */}
                <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest relative z-10">
                  Step {num}
                </p>

                <h3 className="text-xl font-black text-gray-900 mb-3 relative z-10">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed relative z-10">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
