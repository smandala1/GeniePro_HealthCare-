import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import path from "path"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createClient() {
  const dbUrl =
    process.env.DATABASE_URL ?? `file:${path.resolve(process.cwd(), "prisma/dev.db")}`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adapter = new PrismaLibSql({ url: dbUrl }) as any
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
