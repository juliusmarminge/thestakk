import { ConvexQueryClient } from "@convex-dev/react-query";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ConvexProviderWithAuth } from "convex/react";
import { toast } from "sonner";
import { routeTree } from "~/routeTree.gen";
import { useAuthForConvex } from "./auth/client";

// import { parse, stringify } from "devalue";

// export const transformer = {
//   serialize: stringify,
//   deserialize: parse,
// };

export function createRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
  if (!CONVEX_URL) console.error("Missing required VITE_CONVEX_URL");

  const convexQueryClient = new ConvexQueryClient(CONVEX_URL, {
    logger: false,
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      // dehydrate: {
      //   serializeData: transformer.serialize,
      // },
      // hydrate: {
      //   deserializeData: transformer.deserialize,
      // },
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
    defaultOnCatch(error, errorInfo) {
      console.error(error, errorInfo);
    },
    scrollRestoration: true,
    context: {
      queryClient,
    },
    Wrap: (props) => {
      return (
        <ConvexProviderWithAuth client={convexQueryClient.convexClient} useAuth={useAuthForConvex}>
          {props.children}
        </ConvexProviderWithAuth>
      );
    },
  });

  return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
