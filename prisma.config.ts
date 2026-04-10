import "dotenv/config"
import { defineConfig } from "prisma/config"

// DIRECT_URL bypasses pgbouncer — required for migrations and db push
const url =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://localhost:5432/geniepro"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: { url },
})
