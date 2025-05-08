import { convexAdapter } from "@better-auth-kit/convex";
import { betterAuth } from "better-auth";
import { passkey } from "better-auth/plugins/passkey";
import { reactStartCookies } from "better-auth/react-start";
import { ConvexHttpClient } from "convex/browser";
import { Resource } from "sst";

const convexClient = new ConvexHttpClient(Resource.ConvexUrl.value);

export const auth = betterAuth({
  secret: Resource.AuthSecret.value,
  database: convexAdapter(convexClient),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    passkey(),
    reactStartCookies(), // make sure this is the last plugin in the array
  ],
});
