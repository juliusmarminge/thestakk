import {
  CircleStackIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import {
  Link,
  type RegisteredRouter,
  type ToPathOption,
  linkOptions,
} from "@tanstack/react-router";
import { NavMain } from "~/components/nav-main";
import { NavSecondary } from "~/components/nav-secondary";
import { NavUser } from "~/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

export type NavItem = {
  title: string;
  to: ToPathOption<RegisteredRouter>;
  icon?: React.ElementType;
  isActive?: boolean;
  items?: NavItem[];
};

const data = {
  navMain: linkOptions([
    {
      title: "Dashboard",
      to: "/",
      icon: RocketLaunchIcon,
    },
    {
      title: "Data Library",
      to: "/placeholder",
      icon: CircleStackIcon,
    },
  ]),
  navSecondary: linkOptions([
    {
      title: "Settings",
      to: "/settings",
      icon: Cog6ToothIcon,
    },
    {
      title: "Search",
      to: "/placeholder",
      icon: MagnifyingGlassIcon,
    },
  ]),
} satisfies Record<string, NavItem[]>;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link to="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-5 fill-none stroke-2 stroke-current"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0 -18z" />
                  <path d="M6 12a6 6 0 0 1 6 -6" />
                </svg>
                <span className="font-semibold text-base">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
