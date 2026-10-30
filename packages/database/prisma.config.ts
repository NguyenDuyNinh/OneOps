import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";
config({
  path: fileURLToPath(new URL("../../apps/api/.env", import.meta.url)),
  quiet: true,
});
export default defineConfig({
  schema: "prisma/schema",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://etctha:etctha_dev@127.0.0.1:55432/etctha",
  },
});
