import { createAuth } from "#convex/auth";
import {
  fetchSession,
  getCookieName,
  setupFetchClient,
} from "@convex-dev/better-auth/react-start";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import { createServerFn } from "@tanstack/react-start";

export const { fetchQuery, fetchMutation, fetchAction } =
  await setupFetchClient(createAuth, getCookie);

// Get auth information for SSR using available cookies
export const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { createAuth } = await import("#convex/auth");
  const { session } = await fetchSession(getRequest());
  const sessionCookieName = getCookieName(createAuth);
  const token = getCookie(sessionCookieName);
  return {
    userId: session?.user.id,
    token,
  };
});
