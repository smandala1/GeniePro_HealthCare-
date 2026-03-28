"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/landing/Navbar"

const CONTACT_ITEMS = [
  { label: "CALL US", val: "(470) 297-2727", href: "tel:4702972727" },
  { label: "EMAIL US", val: "info@genieprohealthcare.com", href: "mailto:info@genieprohealthcare.com" },
  { label: "HIRING", val: "hiring@genieprohealthcare.com", href: "mailto:hiring@genieprohealthcare.com" },
  { label: "VISIT US", val: "925 North Point Pkwy. Ste 130\nAlpharetta, GA 30005", href: "https://maps.google.com/?q=925+North+Point+Pkwy+Alpharetta+GA" },
]

type FormState = { name: string; email: string; phone: string; subject: string; message: string }
type Status = "idle" | "loading" | "success" | "error"

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", subject: "", message: "" })
  const [status, setStatus] = useState<Status>("idle")

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setForm({ name: "", email: "", phone: "", subject: "", message: "" })
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <Navbar />
      <main className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#2EC4B6] text-sm font-bold uppercase tracking-widest mb-3">Contact Us</p>
            <h1 className="text-4xl font-black text-[#0F1E2E] mb-4">Get In Touch</h1>
            <p className="text-gray-500">Reach out — we respond within 24 hours.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-4">
              {CONTACT_ITEMS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.label === "VISIT US" ? "_blank" : undefined}
                  rel={c.label === "VISIT US" ? "noopener noreferrer" : undefined}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#2F80ED] transition-all"
                >
                  <p className="text-xs font-bold text-[#2EC4B6] uppercase tracking-widest mb-2">{c.label}</p>
                  <p className="text-gray-800 font-semibold whitespace-pre-line">{c.val}</p>
                </a>
              ))}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-48">
                <iframe
                  src="https://maps.google.com/maps?q=925+North+Point+Pkwy+Ste+130+Alpharetta+GA+30005&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="GeniePro Healthcare Location"
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-4">
              <h2 className="text-xl font-bold text-[#0F1E2E] mb-2">Send a Message</h2>

              {status === "success" && (
                <div className="bg-green-50 text-green-700 rounded-xl p-4 text-sm font-medium">
                  ✅ Message sent! We&apos;ll respond within 24 hours.
                </div>
              )}
              {status === "error" && (
                <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm font-medium">
                  Something went wrong. Please try again.
                </div>
              )}

              {(["name", "email", "phone", "subject"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm font-semibold text-gray-700 block mb-1 capitalize">
                    {field === "name" ? "Full Name" : field === "email" ? "Email Address" : field === "phone" ? "Phone (optional)" : "Subject"}
                  </label>
                  <input
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    value={form[field]}
                    onChange={set(field)}
                    required={field !== "phone"}
                    placeholder={
                      field === "name" ? "Jane Smith" :
                      field === "email" ? "you@example.com" :
                      field === "phone" ? "(555) 000-0000" : "How can we help?"
                    }
                    className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Tell us about your staffing needs..."
                  className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#2F80ED] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-12 rounded-full text-white font-bold text-sm disabled:opacity-60 hover:opacity-90 transition"
                style={{ background: "linear-gradient(135deg,#2F80ED,#2EC4B6)" }}
              >
                {status === "loading" ? "Sending..." : "Send Message →"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <span className="text-sm text-white/40">© {new Date().getFullYear()} GeniePro Healthcare · Alpharetta, GA</span>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/jobs" className="hover:text-white/70 transition-colors">Find Jobs</Link>
            <Link href="/privacy-policy" className="hover:text-white/70 transition-colors">Privacy</Link>
            <Link href="/terms-and-conditions" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
