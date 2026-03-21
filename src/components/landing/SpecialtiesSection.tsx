import Link from "next/link"

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
    <section id="specialties" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">

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
              <img
                src={s.image}
                alt={s.label}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-500"
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
                <p className="text-xs text-white/60 font-medium mb-1">{s.count}</p>
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
