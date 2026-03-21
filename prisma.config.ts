import "dotenv/config"
import path from "node:path"
import { defineConfig } from "prisma/config"

const dbUrl =
  process.env.DATABASE_URL ?? `file:${path.resolve(process.cwd(), "prisma/dev.db")}`

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: { url: dbUrl },
})
