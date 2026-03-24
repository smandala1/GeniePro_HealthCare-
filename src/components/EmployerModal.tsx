"use client"

interface EmployerModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EmployerModal({ isOpen, onClose }: EmployerModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 50, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-8 w-full mx-4 relative"
        style={{ maxWidth: "448px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#2EC4B6" }}>
          For Employers
        </p>
        <h2 className="text-2xl font-black mt-1" style={{ color: "#1F2937" }}>
          Let&apos;s Talk Hiring
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Reach out to our team and we&apos;ll help you find the right candidates fast.
        </p>

        <hr className="border-t border-gray-100 my-6" />

        {/* Contact info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Email Us</p>
            <a
              href="mailto:hiring@genieprohealthcare.com"
              className="font-semibold hover:underline"
              style={{ color: "#2F80ED" }}
            >
              hiring@genieprohealthcare.com
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Call Us</p>
            <a href="tel:+14702972727" className="font-semibold text-gray-800">
              (470) 297-2727
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Based In</p>
            <p className="font-semibold text-gray-800">925 North Point Pkwy. Ste 130, Alpharetta, GA 30005</p>
          </div>
        </div>
      </div>
    </div>
  )
}
