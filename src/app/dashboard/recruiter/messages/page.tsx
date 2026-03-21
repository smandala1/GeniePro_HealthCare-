"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Inbox, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatRelativeTime, getInitials, cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Message = {
  id: string
  subject?: string | null
  content: string
  isRead: boolean
  createdAt: string
  from: { id: string; name: string; avatarUrl?: string | null; role: string }
  to: { id: string; name: string; avatarUrl?: string | null; role: string }
  replies: Array<{
    id: string; content: string; createdAt: string
    from: { id: string; name: string; avatarUrl?: string | null }
  }>
}

export default function RecruiterMessagesPage() {
  const { data: session } = useSession()
  const { data: messages, isLoading } = useSWR<Message[]>("/api/messages", fetcher)
  const [selected, setSelected] = useState<Message | null>(null)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)

  async function markRead(msg: Message) {
    if (!msg.isRead && msg.to.id === session?.user?.id) {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg.id }),
      })
      await mutate("/api/messages")
    }
    setSelected(msg)
  }

  async function sendReply() {
    if (!reply.trim() || !selected) return
    setSending(true)
    const otherId = selected.from.id === session?.user?.id ? selected.to.id : selected.from.id
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toId: otherId, content: reply, parentId: selected.id }),
    })
    setReply("")
    await mutate("/api/messages")
    setSending(false)
  }

  const unread = messages?.filter((m) => !m.isRead && m.to.id === session?.user?.id).length ?? 0

  return (
    <div className="p-6 lg:p-8 w-full max-w-screen-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unread > 0 ? `${unread} unread message${unread === 1 ? "" : "s"}` : "All caught up!"}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 h-[calc(100vh-220px)] min-h-[400px]">
        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-gray-100">
              <CardTitle className="text-sm flex items-center gap-2">
                <Inbox className="h-4 w-4 text-primary-500" /> Inbox
              </CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400 mt-1">Start a conversation with candidates.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const other = msg.from.id === session?.user?.id ? msg.to : msg.from
                  const isUnread = !msg.isRead && msg.to.id === session?.user?.id
                  return (
                    <button
                      key={msg.id}
                      onClick={() => markRead(msg)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors",
                        selected?.id === msg.id && "bg-primary-50",
                        isUnread && "border-l-2 border-primary-500"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-accent-100 flex items-center justify-center shrink-0 text-xs font-bold text-accent-700">
                          {getInitials(other.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={cn("text-sm truncate", isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                              {other.name}
                            </p>
                            <span className="text-[10px] text-gray-400 shrink-0">{formatRelativeTime(msg.createdAt)}</span>
                          </div>
                          {msg.subject && <p className="text-xs text-gray-500 truncate">{msg.subject}</p>}
                          <p className="text-xs text-gray-400 truncate">{msg.content}</p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 flex flex-col">
          {!selected ? (
            <Card className="flex-1 flex items-center justify-center">
              <CardContent className="text-center py-12">
                <ChevronRight className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Select a message to read</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 border-b border-gray-100">
                <div>
                  <CardTitle className="text-sm">{selected.subject || "Message"}</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {selected.from.id === session?.user?.id ? `To: ${selected.to.name}` : `From: ${selected.from.name}`}
                    {" · "}{formatRelativeTime(selected.createdAt)}
                  </p>
                </div>
              </CardHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  selected.from.id === session?.user?.id
                    ? "ml-auto bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-800"
                )}>
                  {selected.content}
                </div>
                {selected.replies.map((r) => (
                  <div key={r.id} className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    r.from.id === session?.user?.id
                      ? "ml-auto bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {r.content}
                    <p className="text-[10px] mt-1 opacity-60">{formatRelativeTime(r.createdAt)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                  placeholder="Type a reply…"
                  className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <button
                  onClick={sendReply}
                  disabled={sending || !reply.trim()}
                  className="h-10 w-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
