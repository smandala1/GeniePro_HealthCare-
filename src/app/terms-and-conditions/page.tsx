import Link from "next/link"
import Navbar from "@/components/landing/Navbar"

export const metadata = {
  title: "Terms & Conditions — GeniePro Healthcare",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black text-[#0F1E2E] mb-2">Terms & Conditions</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the GeniePro Healthcare platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">2. Platform Use</h2>
            <p>GeniePro Healthcare provides a staffing and job placement platform for healthcare professionals and employers. You agree to use the platform only for lawful purposes and in a manner consistent with all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate and complete information and to update it as necessary.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">4. Professional Credentials</h2>
            <p>Healthcare professionals using this platform represent that all credentials, licenses, certifications, and employment history provided are accurate and current. Misrepresentation of professional qualifications may result in immediate account termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">5. Employer Obligations</h2>
            <p>Employers posting positions agree to comply with all applicable employment laws, provide accurate job descriptions, and maintain a non-discriminatory hiring process in compliance with federal and state law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">6. Limitation of Liability</h2>
            <p>GeniePro Healthcare serves as a platform connecting candidates and employers. We are not responsible for employment decisions, working conditions, or outcomes of placements. Our liability is limited to the maximum extent permitted by applicable law.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">7. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform, with or without notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">8. Governing Law</h2>
            <p>These terms are governed by the laws of the State of Georgia. Any disputes shall be resolved in the courts of Fulton County, Georgia.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">9. Contact</h2>
            <p>
              GeniePro Healthcare<br />
              925 North Point Pkwy. Ste 130<br />
              Alpharetta, GA 30005<br />
              <a href="mailto:info@genieprohealthcare.com" className="text-[#2F80ED] hover:underline">info@genieprohealthcare.com</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex gap-6">
          <Link href="/" className="text-sm text-[#2F80ED] hover:underline">← Home</Link>
          <Link href="/privacy-policy" className="text-sm text-[#2F80ED] hover:underline">Privacy Policy</Link>
        </div>
      </main>
    </div>
  )
}
