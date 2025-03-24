import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { passkey } from "better-auth/plugins/passkey";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

export const auth = betterAuth({
  secret: "L35HPPlH6iPBZ01fb40B0Tl0zPhNi7x7", // TODO: load from env
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.UserTable,
      session: schema.SessionTable,
      account: schema.AccountTable,
      verification: schema.VerificationTable,
      passkey: schema.PasskeyTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [passkey()],
});
