"use client"

import { useState, useRef, useEffect } from "react"
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, X } from "lucide-react"

interface ContactPopupProps {
  isOpen: boolean
  onClose: () => void
  anchorRef?: React.RefObject<HTMLElement>
}

export default function ContactPopup({ isOpen, onClose, anchorRef }: ContactPopupProps) {
  const [tab, setTab] = useState<"info" | "message">("info")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        !(anchorRef?.current?.contains(e.target as Node))
      ) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      })
      if (res.ok) {
        setSent(true)
        setName("")
        setEmail("")
        setMessage("")
        setTimeout(() => setSent(false), 5000)
      } else {
        const d = await res.json()
        setError(d.error || "Failed to send. Please try again.")
      }
    } catch {
      setError("Network error. Please try again.")
    }
    setSending(false)
  }

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
      style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.14)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex gap-1 bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setTab("info")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              tab === "info" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Contact Info
          </button>
          <button
            onClick={() => setTab("message")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              tab === "message" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Send Message
          </button>
        </div>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tab: Contact Info */}
      {tab === "info" && (
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="h-4 w-4 text-[#2F80ED]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Call Us</p>
              <a href="tel:+14702972727" className="text-sm font-semibold text-gray-900 hover:text-[#2F80ED] transition-colors">
                (470) 297-2727
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="h-4 w-4 text-[#2EC4B6]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">General Inquiries</p>
              <a href="mailto:info@genieprohealthcare.com" className="text-sm font-semibold text-gray-900 hover:text-[#2EC4B6] transition-colors">
                info@genieprohealthcare.com
              </a>
              <p className="text-xs text-gray-400 font-medium mt-2 mb-0.5">Hiring / Employers</p>
              <a href="mailto:hiring@genieprohealthcare.com" className="text-sm font-semibold text-gray-900 hover:text-[#2F80ED] transition-colors">
                hiring@genieprohealthcare.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium mb-0.5">Office Address</p>
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                925 North Point Pkwy. Ste 130<br />
                Alpharetta, GA 30005, USA
              </p>
            </div>
          </div>

          {/* Map embed */}
          <div className="rounded-xl overflow-hidden border border-gray-100 mt-2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.9!2d-84.2955!3d34.0755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88f57d7d8d8b8b8b%3A0x0!2s925+North+Point+Pkwy+%23130%2C+Alpharetta%2C+GA+30005!5e0!3m2!1sen!2sus!4v1"
              width="100%"
              height="140"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="GeniePro Healthcare office location"
            />
          </div>
        </div>
      )}

      {/* Tab: Send Message */}
      {tab === "message" && (
        <div className="p-4">
          {sent ? (
            <div className="py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 text-sm">Message sent!</p>
              <p className="text-xs text-gray-400 mt-1">We&apos;ll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-3">
              {error && (
                <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Your email"
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="How can we help?"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full h-9 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
              >
                {sending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
