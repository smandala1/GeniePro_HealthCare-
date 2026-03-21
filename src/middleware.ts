import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const loginUrl = new URL("/auth/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role as string
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith("/dashboard/recruiter") && role !== "RECRUITER") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }
    if (pathname.startsWith("/dashboard/candidate") && role !== "CANDIDATE") {
      return NextResponse.redirect(new URL(`/dashboard/${role.toLowerCase()}`, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
