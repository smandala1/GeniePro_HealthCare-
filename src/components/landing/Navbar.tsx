"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const NAV_LINKS = [
  { href: "/jobs",           label: "Find Jobs" },
  { href: "/#specialties",   label: "Specialties" },
  { href: "/#for-employers", label: "For Employers" },
  { href: "/#about",         label: "About" },
  { href: "/#contact",       label: "Contact" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <img
            src="/GeniePro Health.png"
            alt="GeniePro Healthcare"
            style={{
              mixBlendMode: "multiply",
              height: "250px",
              width: "250px",
              objectFit: "contain",
            }}
          />
        </Link>

        {/* Desktop Nav */}
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
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #1D6DD4, #25A99D)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #2F80ED, #2EC4B6)"
            }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="flex flex-col">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="px-6 py-3.5 text-sm font-medium text-gray-600
                  hover:text-[#2F80ED] hover:bg-gray-50 border-b border-gray-100
                  transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="px-6 py-5 flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700 text-center py-2.5
                  border-2 border-gray-200 rounded-full
                  hover:border-[#2F80ED] hover:text-[#2F80ED] transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-white text-center py-2.5 rounded-full btn-gradient"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
