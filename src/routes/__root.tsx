/// <reference types="vite/client" />
import type { ConvexQueryClient } from "@convex-dev/react-query";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { getThemeColorMetaTags, ThemeProvider } from "@tanstack-themes/react";
import type { ConvexReactClient } from "convex/react";
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
      className="theme-neutral md:bg-sidebar"
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
