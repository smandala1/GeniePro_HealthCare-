"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import EmployerModal from "@/components/EmployerModal"
import ContactPopup from "@/components/ContactPopup"

const NAV_LINKS = [
  { href: "/jobs",         label: "Find Jobs" },
  { href: "/#specialties", label: "Specialties" },
  { href: "/#about",       label: "About" },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [employerModalOpen, setEmployerModalOpen] = useState(false)
  const [contactPopupOpen, setContactPopupOpen] = useState(false)
  const contactBtnRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/GeniePro Health.png"
              alt="GeniePro Healthcare"
              width={250}
              height={250}
              style={{ mixBlendMode: "multiply", objectFit: "contain" }}
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

            {/* For Employers — opens modal */}
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

            {/* Contact — opens popup */}
            <div className="relative">
              <button
                ref={contactBtnRef}
                type="button"
                onClick={() => setContactPopupOpen((v) => !v)}
                className="relative inline-block text-sm font-medium text-gray-500 pb-0.5
                  hover:text-[#2F80ED] transition-colors duration-200
                  after:content-[''] after:absolute after:bottom-0 after:left-0
                  after:w-0 after:h-0.5 after:bg-[#2F80ED]
                  after:transition-all after:duration-200 hover:after:w-full"
              >
                Contact
              </button>
              <ContactPopup
                isOpen={contactPopupOpen}
                onClose={() => setContactPopupOpen(false)}
                anchorRef={contactBtnRef}
              />
            </div>
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
              <button
                type="button"
                onClick={() => { setOpen(false); setEmployerModalOpen(true) }}
                className="px-6 py-3.5 text-sm font-medium text-gray-600 text-left
                  hover:text-[#2F80ED] hover:bg-gray-50 border-b border-gray-100
                  transition-colors"
              >
                For Employers
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setContactPopupOpen(true) }}
                className="px-6 py-3.5 text-sm font-medium text-gray-600 text-left
                  hover:text-[#2F80ED] hover:bg-gray-50 border-b border-gray-100
                  transition-colors"
              >
                Contact
              </button>
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

      <EmployerModal isOpen={employerModalOpen} onClose={() => setEmployerModalOpen(false)} />
    </>
  )
}
