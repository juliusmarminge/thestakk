import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { jwtQueryOptions, sessionQueryOptions } from "~/auth/client";
import { auth } from "~/auth/server";
import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider, getSidebarCookie } from "~/components/ui/sidebar";

const getServerSession = createServerFn().handler(async () => {
  const session = await auth.api.getSession({
    headers: getWebRequest()?.headers ?? new Headers(),
  });
  return session;
});

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context }) => {
    const serverSession = await getServerSession();
    if (!serverSession) {
      throw redirect({ to: "/login" });
    }

    context.queryClient.setQueryData(sessionQueryOptions.queryKey, serverSession);
    await context.queryClient.ensureQueryData(jwtQueryOptions);

    return { session: serverSession };
  },
  loader: () => getSidebarCookie(),
  component: AppLayout,
});

function AppLayout() {
  const { open: sidebarDefaultOpen, side: sidebarDefaultSide } = Route.useLoaderData();

  return (
    <SidebarProvider
      defaultOpen={sidebarDefaultOpen}
      defaultSide={sidebarDefaultSide}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
