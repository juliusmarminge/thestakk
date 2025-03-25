import { drizzle } from "drizzle-orm/libsql";
import { Resource } from "sst";
import * as schema from "~/db/schema";

export const db = drizzle({
  connection: {
    url: Resource.TursoUrl.value,
    authToken: Resource.TursoToken.value,
  },
  schema,
});
