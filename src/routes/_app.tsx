import { Outlet, createFileRoute } from "@tanstack/react-router";
import { sessionQueryOptions } from "~/auth/client";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";

export const Route = createFileRoute("/_app")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(sessionQueryOptions);
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider
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
