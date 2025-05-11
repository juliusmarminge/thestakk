import { convexAdapter } from "@better-auth-kit/convex";
import { betterAuth } from "better-auth";
import { genericOAuthClient } from "better-auth/client/plugins";
import { jwt, oidcProvider } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { reactStartCookies } from "better-auth/react-start";
import { ConvexHttpClient } from "convex/browser";
import { Resource } from "sst";

const convexClient = new ConvexHttpClient(Resource.ConvexUrl.value, {
  logger: false,
});

console.log("[auth] convexDeployment", Resource.ConvexDeployment.value);
console.log("[auth] convexUrl", Resource.ConvexUrl.value);
console.log("[auth] auth issuer", Resource.AppDomain.value);

export const auth = betterAuth({
  secret: Resource.AuthSecret.value,
  database: convexAdapter(convexClient),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    passkey(),
    jwt({
      jwks: {
        keyPairConfig: {
          alg: "RS256",
        },
      },
    }),
    oidcProvider({
      loginPage: "/login",
    }),
    genericOAuthClient(),
    reactStartCookies(), // make sure this is the last plugin in the array
  ],
});
