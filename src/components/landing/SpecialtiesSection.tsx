import Link from "next/link"
import Image from "next/image"

const SPECIALTIES = [
  {
    key: "NURSING",
    label: "Nursing",
    desc: "ICU, OR, Travel RN, L&D, ER and more",
    count: "2,400+ roles",
    image: "/Nursing.jpeg",
    href: "/jobs?specialty=NURSING",
  },
  {
    key: "ALLIED_HEALTH",
    label: "Allied Health",
    desc: "PT, OT, Radiology, Lab, Respiratory & more",
    count: "1,100+ roles",
    image: "/Allied health.jpg",
    href: "/jobs?specialty=ALLIED_HEALTH",
  },
  {
    key: "NONCLINICAL",
    label: "Nonclinical",
    desc: "Admin, coding, HIM & compliance",
    count: "860+ roles",
    image: "/Non_Clinical.jpg",
    href: "/jobs?specialty=NONCLINICAL",
  },
  {
    key: "PHARMA",
    label: "Pharma",
    desc: "Clinical trials, regulatory affairs & MSL",
    count: "540+ roles",
    image: "/Pharma.jpg",
    href: "/jobs?specialty=PHARMA",
  },
]

export default function SpecialtiesSection() {
  return (
    <section id="specialties" className="relative bg-white py-24 overflow-hidden">

      {/* ── Purely decorative background layer ── */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true" style={{ zIndex: 0 }}>

        {/* Teal radial glow — top-right corner */}
        <div style={{
          position: "absolute",
          top: "-80px", right: "-80px",
          width: "520px", height: "520px",
          background: "radial-gradient(circle, rgba(46,196,182,0.14) 0%, transparent 62%)",
          filter: "blur(48px)",
        }} />
        {/* Secondary blue wash — bottom-left */}
        <div style={{
          position: "absolute",
          bottom: "-60px", left: "-60px",
          width: "360px", height: "360px",
          background: "radial-gradient(circle, rgba(47,128,237,0.07) 0%, transparent 65%)",
          filter: "blur(40px)",
        }} />

        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="spec-dots-pattern" x="0" y="0" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" fill="#2EC4B6" opacity="0.09" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#spec-dots-pattern)" />
        </svg>

        {/* Plus icon — top-left */}
        <svg className="absolute" style={{ top: "18%", left: "3%", opacity: 0.13 }} width="14" height="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2F80ED" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Plus icon — bottom-right */}
        <svg className="absolute" style={{ bottom: "20%", right: "4%", opacity: 0.14 }} width="12" height="12" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="0" x2="8" y2="16" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="0" y1="8" x2="16" y2="8" stroke="#2EC4B6" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

      </div>

      <div className="relative max-w-7xl mx-auto px-6" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="text-center mb-12">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: "#2F80ED" }}
          >
            Explore
          </p>
          <h2 className="text-3xl font-black text-gray-900">
            Browse by Specialty
          </h2>
        </div>

        {/* Cards — all 4 use images */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SPECIALTIES.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-end transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              style={{ height: "256px" }}
            >
              {/* Background image */}
              <Image
                src={s.image}
                alt={s.label}
                fill
                className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500"
              />

              {/* Dark gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.10) 60%, transparent 100%)",
                }}
              />

              {/* Text content */}
              <div className="relative z-10 p-5">
                <h3 className="text-xl font-bold text-white mb-1.5 leading-tight">
                  {s.label}
                </h3>
                <span className="text-sm font-semibold text-[#2EC4B6] group-hover:text-white transition-colors duration-200">
                  Explore roles →
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
