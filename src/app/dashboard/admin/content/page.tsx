"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import {
  FileEdit, Plus, Star,
  Loader2, CheckCircle2, AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Testimonial = {
  id: string
  name: string
  role: string
  company?: string | null
  content: string
  rating: number
  isActive: boolean
  displayOrder: number
}

const EMPTY_FORM = { name: "", role: "", company: "", content: "", rating: "5" }

export default function AdminContentPage() {
  const { data: testimonials, isLoading } = useSWR<Testimonial[]>("/api/testimonials", fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
  }

  async function submitTestimonial() {
    setSubmitting(true)
    setError("")
    const res = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, rating: parseInt(form.rating) }),
    })
    if (res.ok) {
      setForm(EMPTY_FORM)
      setShowForm(false)
      setSuccess("Testimonial added!")
      await mutate("/api/testimonials")
      setTimeout(() => setSuccess(""), 2000)
    } else {
      const d = await res.json()
      setError(d.error || "Failed to add testimonial")
    }
    setSubmitting(false)
  }

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage testimonials and platform content.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Testimonial
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <Card className="mb-6 border-primary-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary-500" /> New Testimonial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Name</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Smith" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Role / Title</label>
                <input type="text" value={form.role} onChange={(e) => update("role", e.target.value)} placeholder="ICU Nurse" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Company (optional)</label>
                <input type="text" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="General Hospital" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Rating</label>
                <select value={form.rating} onChange={(e) => update("rating", e.target.value)} className={inputCls}>
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Testimonial Content</label>
              <textarea
                value={form.content}
                onChange={(e) => update("content", e.target.value)}
                rows={3}
                placeholder="What did this person say about GeniePro Healthcare?"
                className={`${inputCls} h-auto`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={submitTestimonial}
                disabled={submitting || !form.name || !form.content}
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} Add Testimonial
              </button>
              <button onClick={() => setShowForm(false)} className="h-10 px-3 rounded-xl text-gray-400 hover:text-gray-600 text-sm transition-colors">
                Cancel
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testimonials list */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-400" /> Testimonials
          {testimonials && <Badge variant="secondary" className="text-[11px]">{testimonials.length}</Badge>}
        </h2>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : !testimonials || testimonials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileEdit className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500">No testimonials yet. Add one above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <Card key={t.id} className={t.isActive ? "" : "opacity-50"}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}{t.company ? ` · ${t.company}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant={t.isActive ? "success" : "secondary"} className="text-[10px]">
                        {t.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 italic">&ldquo;{t.content}&rdquo;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const inputCls = "h-10 w-full px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all"
