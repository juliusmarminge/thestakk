/// <reference types="vite/client" />
import { ConvexQueryClient } from "@convex-dev/react-query";
import { getThemeColorMetaTags, ThemeProvider } from "@tanstack-themes/react";
import type { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { ConvexReactClient } from "convex/react";
import { getConvexToken } from "~/auth/client";
import { TanstackDevtools } from "~/components/devtools";
import {
  ErrorComponent,
  NotFoundComponent,
} from "~/components/error-component";
import { Toaster } from "~/components/ui/sonner";
import { themeColorMap } from "~/lib/themes";
import stylesUrl from "~/styles/index.css?url";

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
        <TanstackDevtools />
      </body>
    </html>
  );
}
