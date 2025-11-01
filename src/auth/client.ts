import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { queryOptions } from "@tanstack/react-query";
import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [passkeyClient(), convexClient()],
});

export const sessionQueryOptions = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const session = await authClient.getSession();
    if (session.error) throw session.error;
    return session.data;
  },
});

export const passkeysQueryOptions = queryOptions({
  queryKey: ["passkeys"],
  queryFn: async () => {
    const passkeys = await authClient.passkey.listUserPasskeys();
    if (passkeys.error) throw passkeys.error;
    return passkeys.data;
  },
});
