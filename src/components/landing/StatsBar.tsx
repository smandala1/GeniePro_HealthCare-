const STATS = [
  { value: "5,000+", label: "Healthcare Professionals" },
  { value: "500+",   label: "Partner Facilities" },
  { value: "4",      label: "Specialties Covered" },
  { value: "98%",    label: "Satisfaction Rate" },
]

export default function StatsBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 lg:gap-y-0 lg:divide-x lg:divide-gray-200">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center lg:px-10">
              <p
                className="text-3xl font-black"
                style={{ color: "#2F80ED" }}
              >
                {value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
