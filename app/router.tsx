import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { TRPCProvider } from "~/lib/trpc";
import { routeTree } from "~/routeTree.gen";
import type { TRPCRouter } from "~/trpc/router";
import { transformer } from "~/trpc/transformer";

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    return `http://localhost:${process.env.PORT ?? 3000}`;
  })();
  return `${base}/api/trpc`;
}

export function createRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      dehydrate: {
        serializeData: transformer.serialize,
      },
      hydrate: {
        deserializeData: transformer.deserialize,
      },
      queries: {
        experimental_prefetchInRender: true,
      },
    },
  });

  const trpcClient = createTRPCClient<TRPCRouter>({
    links: [
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({
          transformer,
          url: getUrl(),
        }),
        false: httpBatchStreamLink({
          transformer,
          url: getUrl(),
        }),
      }),
    ],
  });

  const serverHelpers = createTRPCOptionsProxy({
    client: trpcClient,
    queryClient: queryClient,
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
      trpc: serverHelpers,
    },
    Wrap: (props) => {
      return (
        <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
          {props.children}
        </TRPCProvider>
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
