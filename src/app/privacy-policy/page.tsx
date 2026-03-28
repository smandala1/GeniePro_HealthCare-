import Link from "next/link"
import Navbar from "@/components/landing/Navbar"

export const metadata = {
  title: "Privacy Policy — GeniePro Healthcare",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-black text-[#0F1E2E] mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: March 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including name, email address, phone number, professional credentials, resume, and employment history when you create an account or apply for positions through our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">2. How We Use Your Information</h2>
            <p>We use collected information to match candidates with job opportunities, communicate about positions and applications, improve our services, and comply with legal obligations. We do not sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">3. Information Sharing</h2>
            <p>We share your professional profile with healthcare employers only when you apply for a position or grant explicit permission. We may share information with service providers who assist our operations under confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information from unauthorized access, disclosure, or loss.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">5. Your Rights</h2>
            <p>You may access, update, or request deletion of your personal information at any time by contacting us at <a href="mailto:info@genieprohealthcare.com" className="text-[#2F80ED] hover:underline">info@genieprohealthcare.com</a>. You may also opt out of marketing communications at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">6. Cookies</h2>
            <p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze site usage. You can control cookie settings through your browser.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#0F1E2E] mb-3">7. Contact Us</h2>
            <p>For privacy-related inquiries, contact us at:</p>
            <p className="mt-2">
              GeniePro Healthcare<br />
              925 North Point Pkwy. Ste 130<br />
              Alpharetta, GA 30005<br />
              <a href="mailto:info@genieprohealthcare.com" className="text-[#2F80ED] hover:underline">info@genieprohealthcare.com</a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex gap-6">
          <Link href="/" className="text-sm text-[#2F80ED] hover:underline">← Home</Link>
          <Link href="/terms-and-conditions" className="text-sm text-[#2F80ED] hover:underline">Terms & Conditions</Link>
        </div>
      </main>
    </div>
  )
}
