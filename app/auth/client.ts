import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtClient, oidcClient, passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { ConvexProviderWithAuth } from "convex/react";
import { useCallback } from "react";
import { getConvexToken } from "./get-convex-token";

export const authClient = createAuthClient({
  plugins: [passkeyClient(), jwtClient(), oidcClient()],
});

export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async () => {
    const session = await authClient.getSession();
    if (session.error) throw session.error;
    return session.data;
  },
});

export const passkeysQuery = queryOptions({
  queryKey: ["passkeys"],
  queryFn: async () => {
    const passkeys = await authClient.passkey.listUserPasskeys();
    if (passkeys.error) throw passkeys.error;
    return passkeys.data;
  },
});

export const jwtQuery = queryOptions({
  queryKey: ["jwt"],
  queryFn: async () => {
    const jwt = await getConvexToken();
    if (jwt.error) {
      throw new Error(jwt.error, {
        cause: jwt.details,
      });
    }
    return jwt.idToken;
  },
  staleTime: 30_000,
});

export function useAuthForConvex(): ReturnType<
  React.ComponentProps<typeof ConvexProviderWithAuth>["useAuth"]
> {
  const queryClient = useQueryClient();
  const query = useQuery(jwtQuery);

  const fetchAccessToken = useCallback(
    async (args: { forceRefreshToken: boolean }) => {
      if (args.forceRefreshToken) {
        return queryClient.fetchQuery(jwtQuery);
      }
      return queryClient.ensureQueryData(jwtQuery);
    },
    [queryClient],
  );

  return {
    isLoading: query.isPending,
    isAuthenticated: query.data !== null,
    fetchAccessToken,
  };
}
