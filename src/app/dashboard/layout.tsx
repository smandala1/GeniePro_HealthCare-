import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/layout/Sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Subtle background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-32 -right-32 w-[600px] h-[600px] opacity-[0.06]">
          <defs>
            <linearGradient id="gpg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
          </defs>
          <path d="M400,80 C520,60 680,120 720,260 C760,400 660,520 520,560 C380,600 200,540 120,420 C40,300 80,140 200,100 C280,72 320,96 400,80 Z" fill="url(#gpg1)" />
        </svg>
        <svg viewBox="0 0 700 600" xmlns="http://www.w3.org/2000/svg"
          className="absolute -bottom-40 -left-32 w-[500px] h-[500px] opacity-[0.05]">
          <defs>
            <linearGradient id="gpg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
          </defs>
          <path d="M350,60 C470,40 600,130 620,280 C640,430 540,560 380,580 C220,600 80,500 50,360 C20,220 100,80 220,55 C280,42 300,72 350,60 Z" fill="url(#gpg2)" />
        </svg>
      </div>

      <Sidebar user={session.user} />

      {/* Main uses CSS variable set by Sidebar client component */}
      <main
        className="relative z-10 transition-all duration-300"
        style={{ marginLeft: "var(--sidebar-w, 240px)" }}
      >
        {children}
      </main>
    </div>
  )
}
