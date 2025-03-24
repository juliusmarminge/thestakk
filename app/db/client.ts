import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "~/db/schema";

export const db = drizzle({
  client: createClient({
    url: "file:db.sqlite",
  }),
  schema,
});
