"use client";

import {
  CameraIcon,
  ChartBarIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  FolderIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  Link,
  type RegisteredRouter,
  type ToPathOption,
  linkOptions,
} from "@tanstack/react-router";
import { NavDocuments } from "~/components/nav-documents";
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
      title: "Lifecycle",
      to: "/placeholder",
      icon: ListBulletIcon,
    },
    {
      title: "Analytics",
      to: "/placeholder",
      icon: ChartBarIcon,
    },
    {
      title: "Projects",
      to: "/placeholder",
      icon: FolderIcon,
    },
    {
      title: "Team",
      to: "/placeholder",
      icon: UsersIcon,
    },
  ]),
  navClouds: linkOptions([
    {
      title: "Capture",
      icon: CameraIcon,
      isActive: true,
      to: "/placeholder",
      items: [
        {
          title: "Active Proposals",
          to: "#",
        },
        {
          title: "Archived",
          to: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: DocumentTextIcon,
      to: "/placeholder",
      items: [
        {
          title: "Active Proposals",
          to: "#",
        },
        {
          title: "Archived",
          to: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: SparklesIcon,
      to: "/placeholder",
      items: [
        {
          title: "Active Proposals",
          to: "#",
        },
        {
          title: "Archived",
          to: "#",
        },
      ],
    },
  ]),
  navSecondary: linkOptions([
    {
      title: "Settings",
      to: "/settings",
      icon: Cog6ToothIcon,
    },
    {
      title: "Get Help",
      to: "/placeholder",
      icon: QuestionMarkCircleIcon,
    },
    {
      title: "Search",
      to: "/placeholder",
      icon: MagnifyingGlassIcon,
    },
  ]),
  documents: linkOptions([
    {
      title: "Data Library",
      to: "/placeholder",
      icon: CircleStackIcon,
    },
    {
      title: "Reports",
      to: "/placeholder",
      icon: DocumentTextIcon,
    },
    {
      title: "Word Assistant",
      to: "/placeholder",
      icon: DocumentTextIcon,
    },
  ]),
} satisfies Record<string, NavItem[]>;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/" activeProps={{ className: "bg-sidebar-accent" }}>
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
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
