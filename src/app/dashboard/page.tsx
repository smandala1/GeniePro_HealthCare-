import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/login")

  const role = session.user.role.toLowerCase()
  redirect(`/dashboard/${role}`)
}
