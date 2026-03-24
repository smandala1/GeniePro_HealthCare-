import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendWelcomeEmail } from "@/lib/email"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.isActive) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as "ADMIN" | "RECRUITER" | "CANDIDATE",
          avatarUrl: user.avatarUrl,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-create user on first Google sign-in
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } })
        if (!existing) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? user.email.split("@")[0],
              password: "",
              role: "CANDIDATE",
              isActive: true,
              avatarUrl: user.image ?? null,
              candidateProfile: { create: {} },
            },
          })
          await sendWelcomeEmail(newUser.email, newUser.name ?? "there").catch(() => {})
        } else if (!existing.isActive) {
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Credentials login — user object has role
        token.id = user.id
        token.role = ((user as { role?: string }).role ?? "CANDIDATE") as "ADMIN" | "RECRUITER" | "CANDIDATE"
        token.avatarUrl = (user as { avatarUrl?: string | null }).avatarUrl ?? null
      }
      if (account?.provider === "google" && token.email) {
        // Fetch role from DB for Google sign-ins
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role as "ADMIN" | "RECRUITER" | "CANDIDATE"
          token.avatarUrl = dbUser.avatarUrl
        }
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as "ADMIN" | "RECRUITER" | "CANDIDATE"
      session.user.avatarUrl = token.avatarUrl as string | null
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
}
