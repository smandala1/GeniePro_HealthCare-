"use client"

import { useState } from "react"
import useSWR from "swr"
import { Star, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Review = {
  id: string
  name: string
  role: string
  rating: number
  body: string
  status: string
  createdAt: string
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
        />
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")
  const { data: reviews, isLoading, mutate } = useSWR<Review[]>(
    `/api/admin/reviews?status=${activeTab}`,
    fetcher
  )

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    mutate()
  }

  const tabs = [
    { key: "PENDING",  label: "Pending",  icon: <Clock className="h-3.5 w-3.5" /> },
    { key: "APPROVED", label: "Approved", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    { key: "REJECTED", label: "Rejected", icon: <XCircle className="h-3.5 w-3.5" /> },
  ] as const

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Approve or reject user-submitted reviews.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit mb-6">
        {tabs.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No {activeTab.toLowerCase()} reviews.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-sm">{review.name}</CardTitle>
                      <StarDisplay rating={review.rating} />
                    </div>
                    <p className="text-xs text-gray-500">{review.role} · {formatRelativeTime(review.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    review.status === "APPROVED" ? "bg-green-100 text-green-700" :
                    review.status === "REJECTED" ? "bg-red-100 text-red-600"    :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {review.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 italic mb-4">&ldquo;{review.body}&rdquo;</p>
                <div className="flex gap-2">
                  {review.status !== "APPROVED" && (
                    <button
                      onClick={() => updateStatus(review.id, "APPROVED")}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {review.status !== "REJECTED" && (
                    <button
                      onClick={() => updateStatus(review.id, "REJECTED")}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                  {review.status !== "PENDING" && (
                    <button
                      onClick={() => updateStatus(review.id, "PENDING")}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Reset to Pending
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
