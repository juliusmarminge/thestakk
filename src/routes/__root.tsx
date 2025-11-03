/// <reference types="vite/client" />
import { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { ConvexReactClient } from "convex/react";
import {
  ErrorComponent,
  NotFoundComponent,
} from "~/components/error-component";
import { Toaster } from "~/components/ui/sonner";
import stylesUrl from "~/styles/index.css?url";
import { themeColorMap } from "~/lib/themes";
import { getThemeColorMetaTags, ThemeProvider } from "@tanstack-themes/react";
import { getConvexToken } from "~/auth/client";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Form + Start" },
      ...getThemeColorMetaTags(themeColorMap),
    ],
    links: [{ rel: "stylesheet", href: stylesUrl }],
  }),
  beforeLoad: async ({ context }) => {
    const token = getConvexToken();
    if (token) {
      context.convexQueryClient.serverHttpClient?.setAuth(token);
    }
  },
  component: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="md:bg-sidebar theme-neutral"
      suppressHydrationWarning
    >
      <head>
        <HeadContent />
      </head>
      <body
        className="overscroll-none bg-background font-sans antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider themeColorLookup={themeColorMap} />
        {props.children}
        <Toaster />
        <Scripts />
        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </body>
    </html>
  );
}
