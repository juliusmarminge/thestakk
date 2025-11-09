import type { RegisteredRouter, ValidateToPath } from "@tanstack/react-router";
import type * as React from "react";
import { ThemeToggleIcon } from "~/components/icons";
import { ModeToggle } from "~/components/themes";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLink,
} from "~/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    to: ValidateToPath<RegisteredRouter>;
    icon: React.ElementType;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuLink
                to={item.to}
                activeProps={{ className: "bg-sidebar-accent" }}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuLink>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
            <SidebarMenuButton asChild>
              <label htmlFor="theme-toggle">
                <ThemeToggleIcon />
                <span>Dark Mode</span>
                <ModeToggle className="ml-auto" />
              </label>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
