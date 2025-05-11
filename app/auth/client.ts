import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { jwtClient, oidcClient, passkeyClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { ConvexProviderWithAuth } from "convex/react";
import { useCallback } from "react";
import { getConvexToken } from "./get-convex-token";

export const authClient = createAuthClient({
  plugins: [passkeyClient(), jwtClient(), oidcClient()],
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

export const jwtQueryOptions = queryOptions({
  queryKey: ["jwt"],
  queryFn: async () => {
    const jwt = await getConvexToken();
    if (jwt.error) return null;
    return jwt.idToken;
  },
  staleTime: 30_000,
});

export function useAuthForConvex(): ReturnType<
  React.ComponentProps<typeof ConvexProviderWithAuth>["useAuth"]
> {
  const queryClient = useQueryClient();
  const sessionQuery = useQuery(sessionQueryOptions);
  const jwtQuery = useQuery(jwtQueryOptions);

  const fetchAccessToken = useCallback(
    async (args: { forceRefreshToken: boolean }) => {
      if (!sessionQuery.data) return null;

      if (args.forceRefreshToken) {
        return queryClient.fetchQuery(jwtQueryOptions);
      }
      return queryClient.ensureQueryData(jwtQueryOptions);
    },
    [queryClient, sessionQuery.data],
  );

  return {
    isLoading: sessionQuery.isPending || jwtQuery.isPending,
    isAuthenticated: sessionQuery.data !== null,
    fetchAccessToken,
  };
}
