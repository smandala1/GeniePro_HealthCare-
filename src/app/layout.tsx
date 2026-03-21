import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/SessionProvider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GeniePro Healthcare - Healthcare Staffing Solutions",
  description:
    "Connecting healthcare professionals with leading facilities. Find nursing, allied health, nonclinical and pharma opportunities.",
  keywords: "healthcare jobs, nursing jobs, allied health, healthcare staffing, medical careers",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
