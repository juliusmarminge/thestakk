import { MutationCache, QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { toast } from "sonner";
import { routeTree } from "~/routeTree.gen";

// import { parse, stringify } from "devalue";

// export const transformer = {
//   serialize: stringify,
//   deserialize: parse,
// };

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      // dehydrate: {
      //   serializeData: transformer.serialize,
      // },
      // hydrate: {
      //   deserializeData: transformer.deserialize,
      // },
      queries: {
        experimental_prefetchInRender: true,
      },
    },
    mutationCache: new MutationCache({
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  });

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
  });

  return routerWithQueryClient(router, queryClient);
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
