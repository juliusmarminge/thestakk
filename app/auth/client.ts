import { queryOptions } from "@tanstack/react-query";
import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [passkeyClient()],
});

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const session = await authClient.getSession();
    console.log("SESSION", session);
    if (session.error) throw session.error;
    return session.data;
  },
});

export const sessionTokenQuery = queryOptions({
  ...sessionQuery,
  select: (data) => data?.session.token,
});

export const passkeysQuery = queryOptions({
  queryKey: ["passkeys"],
  queryFn: async () => {
    const passkeys = await authClient.passkey.listUserPasskeys();
    if (passkeys.error) throw passkeys.error;
    return passkeys.data;
  },
});
