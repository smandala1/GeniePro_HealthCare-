import Link from "next/link"
import Navbar from "@/components/landing/Navbar"

export const metadata = {
  title: "About Us — GeniePro Healthcare",
  description: "GeniePro Healthcare connects facilities and professionals with verified, credentialed talent — screened, compliant, and ready to work.",
}

const STATS = [
  { n: "1,200+", l: "Placements Made" },
  { n: "20+", l: "HC Recruiters" },
  { n: "48h", l: "Avg. Turnaround" },
  { n: "95%", l: "Satisfaction Rate" },
]

const WHY = [
  { title: "48h Turnaround", desc: "Active pipeline of 50+ pre-screened candidates. Shortlists delivered in under 48 hours." },
  { title: "Compliance Ready", desc: "Joint Commission standards, vendor insurance, MSA-ready. Risk managed from day one." },
  { title: "National Reach", desc: "Active placements across NY, TX, GA, IL, CA, MI and growing." },
  { title: "Domain Expertise", desc: "Specialized healthcare recruiters — not generalists." },
  { title: "Flexible Engagement", desc: "Contract, Travel, Per Diem, Full-Time — structured to match your needs." },
  { title: "Retention-Focused", desc: "Post-placement support and follow-up to keep talent engaged long-term." },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0F1E2E] to-[#1a3a5c] text-white py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#2EC4B6] text-sm font-bold uppercase tracking-widest mb-4">About Us</p>
            <h1 className="text-5xl font-black mb-6">
              We Find the Talent.<br />
              <span className="text-[#2EC4B6]">You Focus On Care.</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              GeniePro Healthcare connects facilities and professionals with verified, credentialed talent —
              screened, compliant, and ready to work.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-[#F7FAFC]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.l}>
                <div className="text-4xl font-black text-[#2F80ED]">{s.n}</div>
                <div className="text-gray-500 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-[#EBF3FB] rounded-2xl p-8 border-l-4 border-[#2F80ED]">
              <h3 className="text-[#2F80ED] font-bold text-lg mb-3">Vision</h3>
              <p className="text-gray-700 leading-relaxed">
                To be the most trusted healthcare staffing partner — delivering speed, quality, and compliance on every placement.
              </p>
            </div>
            <div className="bg-[#EBF3FB] rounded-2xl p-8 border-l-4 border-[#2EC4B6]">
              <h3 className="text-[#2EC4B6] font-bold text-lg mb-3">Mission</h3>
              <p className="text-gray-700 leading-relaxed">
                To eliminate friction in healthcare hiring by connecting the right professionals with the right facilities — faster than anyone else.
              </p>
            </div>
          </div>
        </section>

        {/* Why GeniePro */}
        <section className="py-20 px-6 bg-[#F7FAFC]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-center text-[#0F1E2E] mb-12">Why GeniePro?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {WHY.map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-[#2F80ED] mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center" style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}>
          <h2 className="text-3xl font-black text-white mb-4">Ready to Work With Us?</h2>
          <p className="text-white/80 mb-8">Reach out to our team and let&apos;s talk about your staffing needs.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="mailto:hiring@genieprohealthcare.com"
              className="bg-white text-[#2F80ED] font-bold px-8 py-3 rounded-full hover:shadow-lg transition"
            >
              hiring@genieprohealthcare.com
            </a>
            <a
              href="tel:4702972727"
              className="bg-white/20 text-white font-bold px-8 py-3 rounded-full border border-white/40 hover:bg-white/30 transition"
            >
              (470) 297-2727
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="text-sm text-white/40">© {new Date().getFullYear()} GeniePro Healthcare · Alpharetta, GA</span>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/jobs" className="hover:text-white/70 transition-colors">Find Jobs</Link>
            <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
