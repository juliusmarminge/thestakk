import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { queryOptions } from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import { passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const getConvexToken = createIsomorphicFn()
  .server(() => getCookie("better-auth.convex_jwt"))
  .client(() => undefined);

export const getRequestCookie = createIsomorphicFn()
  .server(() => getRequest().headers.get("Cookie"))
  .client(() => undefined); // browser handles this

export const authClient = createAuthClient({
  plugins: [passkeyClient(), convexClient()],
  fetchOptions: {
    onRequest(context) {
      const cookie = getRequestCookie();
      if (cookie) context.headers.set("cookie", cookie);
    },
  },
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
    console.log("passkeys", passkeys);
    if (passkeys.error) throw passkeys.error;
    return passkeys.data.map((passkey) => ({
      ...passkey,
      createdAt: new Date(passkey.createdAt),
    }));
  },
});
