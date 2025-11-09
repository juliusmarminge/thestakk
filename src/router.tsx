import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { toast } from "sonner";
import { authClient } from "~/auth/client";
import { routeTree } from "~/routeTree.gen";

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
  if (!CONVEX_URL) console.error("Missing required VITE_CONVEX_URL");

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL, {
    logger: false,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  });
  convexQueryClient.connect(queryClient);

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0, // Let React Query handle caching
    defaultOnCatch(error, errorInfo) {
      console.error("Error in router", error, errorInfo);
    },
    scrollRestoration: true,
    context: {
      queryClient,
      convexClient: convexQueryClient.convexClient,
      convexQueryClient,
    },
    Wrap: (props) => {
      return (
        <ConvexBetterAuthProvider
          client={convexQueryClient.convexClient}
          authClient={authClient}
        >
          {props.children}
        </ConvexBetterAuthProvider>
      );
    },
  });

  setupRouterSsrQueryIntegration({ queryClient, router });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
