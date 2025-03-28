import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getHeader } from "@tanstack/react-start/server";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import * as React from "react";
import { toast } from "sonner";
import { ErrorComponent, NotFoundComponent } from "~/components/error-component";
import {
  EAGER_SET_SYSTEM_THEME_SCRIPT,
  getModeCookie,
  getThemeCookie,
  useThemeStore,
} from "~/components/themes";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";
import stylesUrl from "~/styles/index.css?url";
import type { TRPCRouter } from "~/trpc/router";

const readViewerLocation = createServerFn().handler(async () => {
  const city = getHeader("CloudFront-Viewer-City");
  const country = getHeader("CloudFront-Viewer-Country");
  const region = getHeader("CloudFront-Viewer-Country-Region");
  const regionName = getHeader("CloudFront-Viewer-Country-Region-Name");
  return { city, country, region, regionName };
});

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
  loader: () => Promise.all([getModeCookie(), getThemeCookie(), readViewerLocation()]),
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
  const [mode, { theme, scaled, baseColor }, viewer] = Route.useLoaderData();

  React.useEffect(() => {
    toast.info(`You are in ${viewer.city}, ${viewer.country}`, {
      description: `${viewer.region} (${viewer.regionName})`,
    });

    useThemeStore.setState({ resolvedMode: mode, activeTheme: theme, scaled });
    const match = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(event: MediaQueryListEvent) {
      if (useThemeStore.getState().resolvedMode === "system") {
        useThemeStore.getState().setPreferredMode(event.matches ? "dark" : "light");
      }
    }
    match.addEventListener("change", handleChange);
    return () => match.removeEventListener("change", handleChange);
  }, []);

  const themeClass = {
    default: "theme-default",
    amber: "theme-amber",
    blue: "theme-blue",
    green: "theme-green",
    mono: "theme-mono",
  }[theme];
  const baseColorClass = {
    neutral: "theme-neutral",
    stone: "theme-stone",
    zinc: "theme-zinc",
    gray: "theme-gray",
    slate: "theme-slate",
  }[baseColor];

  return (
    <html
      lang="en"
      className={cn(mode === "dark" && "dark", "md:bg-sidebar")}
      suppressHydrationWarning
    >
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
          themeClass,
          baseColorClass,
          scaled && "theme-scaled",
          // fontVariables,
        )}
      >
        {props.children}
        <Toaster />
        <Scripts />
        <ReactQueryDevtools />
        <TanStackRouterDevtools />
      </body>
    </html>
  );
}
