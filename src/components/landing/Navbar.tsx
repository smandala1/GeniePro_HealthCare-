"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react"
import EmployerModal from "@/components/EmployerModal"
import ContactPopup from "@/components/ContactPopup"

const NAV_LINKS = [
  { href: "/jobs",         label: "Find Jobs" },
  { href: "/#specialties", label: "Specialties" },
  { href: "/about",        label: "About" },
]

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [employerModalOpen, setEmployerModalOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  const userMenuRef = useRef<HTMLDivElement>(null)
  const contactBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const role = (session?.user as { role?: string })?.role

  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const getDashboardLink = () => {
    if (role === "RECRUITER") return "/dashboard/recruiter"
    if (role === "ADMIN") return "/admin/dashboard"
    return "/dashboard"
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-shadow duration-200 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            {!logoError ? (
              <Image
                src="/GeniePro Health.png"
                alt="GeniePro Healthcare"
                width={160}
                height={50}
                style={{ mixBlendMode: "multiply", objectFit: "contain" }}
                onError={() => setLogoError(true)}
                priority
              />
            ) : (
              <span className="font-black text-xl">
                <span style={{ color: "#2F80ED" }}>Genie</span>
                <span style={{ color: "#2EC4B6" }}>Pro</span>
                <span className="text-gray-500 text-sm font-normal ml-1">Healthcare</span>
              </span>
            )}
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative inline-block text-sm font-medium text-gray-500 pb-0.5
                  hover:text-[#2F80ED] transition-colors duration-200
                  after:content-[''] after:absolute after:bottom-0 after:left-0
                  after:w-0 after:h-0.5 after:bg-[#2F80ED]
                  after:transition-all after:duration-200 hover:after:w-full"
              >
                {label}
              </Link>
            ))}

            <button
              type="button"
              onClick={() => setEmployerModalOpen(true)}
              className="relative inline-block text-sm font-medium text-gray-500 pb-0.5
                hover:text-[#2F80ED] transition-colors duration-200
                after:content-[''] after:absolute after:bottom-0 after:left-0
                after:w-0 after:h-0.5 after:bg-[#2F80ED]
                after:transition-all after:duration-200 hover:after:w-full"
            >
              For Employers
            </button>

            <div className="relative">
              <button
                ref={contactBtnRef}
                type="button"
                onClick={() => setContactOpen(v => !v)}
                className="relative inline-block text-sm font-medium text-gray-500 pb-0.5
                  hover:text-[#2F80ED] transition-colors duration-200
                  after:content-[''] after:absolute after:bottom-0 after:left-0
                  after:w-0 after:h-0.5 after:bg-[#2F80ED]
                  after:transition-all after:duration-200 hover:after:w-full"
              >
                Contact
              </button>
              <ContactPopup
                isOpen={contactOpen}
                onClose={() => setContactOpen(false)}
                anchorRef={contactBtnRef}
              />
            </div>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {!session ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 px-4 py-2 rounded-lg
                    hover:text-[#2F80ED] hover:bg-[#EFF6FF] transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-semibold text-white px-5 py-2.5 rounded-full
                    transition-all duration-200 hover:shadow-md hover:scale-[1.03]"
                  style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                  >
                    {getInitials(session.user?.name)}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    <div className="py-1">
                      {role === "ADMIN" ? (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-gray-400" />
                          Admin Panel
                        </Link>
                      ) : role === "RECRUITER" ? (
                        <Link
                          href="/dashboard/recruiter"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard size={15} className="text-gray-400" />
                          Recruiter Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard size={15} className="text-gray-400" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/applications"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User size={15} className="text-gray-400" />
                            My Applications
                          </Link>
                        </>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="flex flex-col">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-3.5 text-sm font-medium text-gray-600
                    hover:text-[#2F80ED] hover:bg-gray-50 border-b border-gray-100
                    transition-colors"
                >
                  {label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setEmployerModalOpen(true) }}
                className="px-6 py-3.5 text-sm font-medium text-gray-600 text-left
                  hover:text-[#2F80ED] hover:bg-gray-50 border-b border-gray-100
                  transition-colors"
              >
                For Employers
              </button>
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setContactOpen(true) }}
                className="px-6 py-3.5 text-sm font-medium text-gray-600 text-left
                  hover:text-[#2F80ED] hover:bg-gray-50 border-b border-gray-100
                  transition-colors"
              >
                Contact
              </button>

              <div className="px-6 py-5 flex flex-col gap-3">
                {!session ? (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-gray-700 text-center py-2.5
                        border-2 border-gray-200 rounded-full
                        hover:border-[#2F80ED] hover:text-[#2F80ED] transition-all duration-200"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-semibold text-white text-center py-2.5 rounded-full"
                      style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 py-1">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #2F80ED, #2EC4B6)" }}
                      >
                        {getInitials(session.user?.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{session.user?.name}</p>
                        <p className="text-xs text-gray-400">{session.user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm text-gray-700 py-2 hover:text-[#2F80ED] transition-colors"
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    {role !== "RECRUITER" && role !== "ADMIN" && (
                      <Link
                        href="/dashboard/applications"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-sm text-gray-700 py-2 hover:text-[#2F80ED] transition-colors"
                      >
                        <User size={15} />
                        My Applications
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false) }}
                      className="flex items-center gap-2 text-sm text-red-600 py-2 text-left"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <EmployerModal isOpen={employerModalOpen} onClose={() => setEmployerModalOpen(false)} />
    </>
  )
}
