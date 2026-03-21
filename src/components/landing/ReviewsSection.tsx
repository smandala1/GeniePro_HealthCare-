"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Star, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react"

type Review = {
  id: string
  name: string
  role: string
  rating: number
  body: string
  createdAt: string
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: "sm" | "md"
}) {
  const [hovered, setHovered] = useState(0)
  const sz = size === "sm" ? "h-4 w-4" : "h-6 w-6"
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${sz} transition-colors ${
              n <= (hovered || value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 min-w-[300px] max-w-[320px] shrink-0 snap-start">
      <StarRating value={review.rating} readonly size="sm" />
      <p className="text-gray-500 text-sm italic leading-relaxed line-clamp-4">
        &ldquo;{review.body}&rdquo;
      </p>
      <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{review.name}</p>
          <p className="text-xs text-gray-400 truncate">{review.role}</p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
          style={{ background: "#EFF9F8", color: "#2EC4B6" }}
        >
          Verified Professional
        </span>
      </div>
    </div>
  )
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: "", role: "", body: "", rating: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    fetch("/api/reviews?status=APPROVED")
      .then((r) => r.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const scrollBy = useCallback((dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" })
  }, [])

  // Auto-scroll every 5s
  useEffect(() => {
    if (reviews.length <= 1 || isPaused) return
    const t = setInterval(() => {
      const el = scrollRef.current
      if (!el) return
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 340, behavior: "smooth" })
      }
    }, 5000)
    return () => clearInterval(t)
  }, [reviews.length, isPaused])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.rating) { setFormError("Please select a star rating."); return }
    if (!form.name.trim()) { setFormError("Please enter your name."); return }
    if (!form.role.trim()) { setFormError("Please enter your role."); return }
    if (!form.body.trim()) { setFormError("Please write your review."); return }
    setSubmitting(true)
    setFormError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setFormError(d.error || "Failed to submit review.")
      } else {
        setSubmitted(true)
        setForm({ name: "", role: "", body: "", rating: 0 })
      }
    } catch {
      setFormError("Something went wrong. Please try again.")
    }
    setSubmitting(false)
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-xs font-bold tracking-widest uppercase mb-3"
            style={{ color: "#2EC4B6" }}
          >
            Testimonials
          </p>
          <h2
            className="text-3xl lg:text-4xl font-black leading-tight"
            style={{ color: "#1F2937" }}
          >
            What Healthcare Professionals Say
          </h2>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-5 gap-10">

          {/* ── Left: Submit form ── */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-3xl p-7 border border-gray-100 h-full">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Share Your Experience</h3>
              <p className="text-sm text-gray-400 mb-6">
                Your review will appear after approval — usually within 24 hours.
              </p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="w-12 h-12 text-[#2EC4B6] mb-4" />
                  <p className="font-bold text-gray-900 text-lg">Thank you!</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Your review has been submitted and will appear after approval.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-5 text-sm text-[#2F80ED] hover:underline font-medium"
                  >
                    Write another review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Star rating */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Your Rating</label>
                    <StarRating
                      value={form.rating}
                      onChange={(v) => { setForm((p) => ({ ...p, rating: v })); setFormError("") }}
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Jane Smith"
                      maxLength={80}
                      className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>

                  {/* Role */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Role / Title</label>
                    <input
                      type="text"
                      value={form.role}
                      onChange={(e) => update("role", e.target.value)}
                      placeholder="Registered Nurse, Atlanta GA"
                      maxLength={100}
                      className="h-11 w-full px-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                    />
                  </div>

                  {/* Review body */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">Your Review</label>
                      <span className={`text-xs ${form.body.length > 270 ? "text-red-500" : "text-gray-400"}`}>
                        {form.body.length}/300
                      </span>
                    </div>
                    <textarea
                      value={form.body}
                      onChange={(e) => update("body", e.target.value.slice(0, 300))}
                      rows={4}
                      placeholder="Tell us about your experience with GeniePro..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all resize-none"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-red-500">{formError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* ── Right: Sliding cards ── */}
          <div className="lg:col-span-3 flex flex-col justify-between gap-5">
            {loading ? (
              <div className="flex gap-4 overflow-hidden">
                {[1, 2].map((i) => (
                  <div key={i} className="min-w-[300px] h-52 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex items-center justify-center h-52 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <>
                <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <style>{`.review-scroll::-webkit-scrollbar { display: none; }`}</style>
                  {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                </div>

                {/* Arrows */}
                {reviews.length > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => scrollBy("left")}
                      className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => scrollBy("right")}
                      className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all"
                      aria-label="Next"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-400">{reviews.length} reviews</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
