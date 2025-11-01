import { Outlet, createFileRoute } from "@tanstack/react-router";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
  getSidebarCookie,
} from "~/components/ui/sidebar";

export const Route = createFileRoute("/_app")({
  loader: () => getSidebarCookie(),
  component: AppLayout,
});

function AppLayout() {
  const { open: sidebarDefaultOpen, side: sidebarDefaultSide } =
    Route.useLoaderData();

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
