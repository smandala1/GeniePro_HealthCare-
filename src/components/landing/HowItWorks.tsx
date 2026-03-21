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
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

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
