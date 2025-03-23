import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import * as React from "react";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  getModeCookie,
  getThemeCookie,
  useThemeStore,
} from "~/components/themes";
import {
  SidebarInset,
  SidebarProvider,
  getSidebarCookie,
} from "~/components/ui/sidebar";
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
  loader: () =>
    Promise.all([getModeCookie(), getThemeCookie(), getSidebarCookie()]),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </RootDocument>
  );
}

function AppLayout(props: {
  children: React.ReactNode;
}) {
  const [, , sidebarDefaultOpen] = Route.useLoaderData();

  return (
    <SidebarProvider
      defaultOpen={sidebarDefaultOpen}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{props.children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function RootDocument(props: { children: React.ReactNode }) {
  const [mode, { theme, scaled }] = Route.useLoaderData();

  React.useEffect(() => {
    useThemeStore.setState({ resolvedMode: mode, activeTheme: theme, scaled });
  }, []);

  return (
    <html lang="en" className={mode === "dark" ? "dark" : ""}>
      <head>
        <HeadContent />
      </head>
      <body
        className={cn(
          "overscroll-none bg-background font-sans antialiased",
          theme ? `theme-${theme}` : "",
          scaled ? "theme-scaled" : "",
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
