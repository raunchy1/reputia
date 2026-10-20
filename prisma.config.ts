import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // `generate` runs at build time without a database; migrate commands need the real URL.
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
