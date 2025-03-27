import type { Config } from "drizzle-kit";
import { Resource } from "sst";

export default {
  schema: "./app/db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: Resource.TursoUrl.value,
    authToken: Resource.TursoToken.value,
  },
} satisfies Config;
