import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import * as React from "react";
import {
  EAGER_SET_SYSTEM_THEME_SCRIPT,
  getModeCookie,
  getThemeCookie,
  useSystemTheme,
  useThemeStore,
} from "~/components/themes";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";
import stylesUrl from "~/styles/index.css?url";
import type { TRPCRouter } from "~/trpc/router";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<TRPCRouter>;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Form + Start" },
    ],
    links: [{ rel: "stylesheet", href: stylesUrl }],
  }),
  loader: () => Promise.all([getModeCookie(), getThemeCookie()]),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument(props: { children: React.ReactNode }) {
  const [mode, { theme, scaled }] = Route.useLoaderData();

  React.useEffect(() => {
    useThemeStore.setState({ resolvedMode: mode, activeTheme: theme, scaled });
  }, []);
  useSystemTheme();

  return (
    <html lang="en" className={cn(mode === "dark" && "dark", "md:bg-sidebar")}>
      <head>
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: needed for immediate theme application
          dangerouslySetInnerHTML={{ __html: EAGER_SET_SYSTEM_THEME_SCRIPT }}
        />
        <HeadContent />
      </head>
      <body
        className={cn(
          "overscroll-none bg-background font-sans antialiased",
          theme && `theme-${theme}`,
          scaled && "theme-scaled",
          // fontVariables,
        )}
      >
        {props.children}
        <Toaster />
        <Scripts />
        <ReactQueryDevtools />
      </body>
    </html>
  );
}
