import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createServerFn } from "@tanstack/react-start";
import { getHeader, getWebRequest } from "@tanstack/react-start/server";
import * as React from "react";
import { toast } from "sonner";
import { jwtQuery, sessionQuery } from "~/auth/client";
import { auth } from "~/auth/server";
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

const readViewerLocation = createServerFn().handler(async () => {
  const city = getHeader("CloudFront-Viewer-City");
  const country = getHeader("CloudFront-Viewer-Country");
  const region = getHeader("CloudFront-Viewer-Country-Region");
  const regionName = getHeader("CloudFront-Viewer-Country-Region-Name");
  return { city, country, region, regionName };
});

const getServerSession = createServerFn().handler(async () => {
  const session = await auth.api.getSession({
    headers: getWebRequest()?.headers ?? new Headers(),
  });
  return session;
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Form + Start" },
    ],
    links: [{ rel: "stylesheet", href: stylesUrl }],
  }),
  beforeLoad: async ({ context }) => {
    const serverSession = await getServerSession();
    console.log("SERVER SESSION", serverSession);
    if (!serverSession) {
      throw redirect({ to: "/login" });
    }

    context.queryClient.setQueryData(sessionQuery.queryKey, serverSession);
    const jwt = await context.queryClient.ensureQueryData(jwtQuery);
    console.log("JWT", jwt);

    return { session: serverSession };
  },
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

    const ac = new AbortController();
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
      "change",
      (event) => {
        if (useThemeStore.getState().resolvedMode === "system") {
          useThemeStore.getState().setPreferredMode(event.matches ? "dark" : "light");
        }
      },
      { signal: ac.signal },
    );
    return () => ac.abort();
    // Only run once
    // eslint-disable-next-line react-hooks/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const themeClass = {
    default: "theme-default",
    amber: "theme-amber",
    sapphire: "theme-sapphire",
    emerald: "theme-emerald",
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
        <TanStackRouterDevtools position="bottom-right" />
      </body>
    </html>
  );
}
