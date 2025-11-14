import { EnvelopeIcon, PlusCircleIcon } from "@heroicons/react/16/solid";
import type { RegisteredRouter, ValidateToPath } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuLink,
} from "~/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    to: ValidateToPath<RegisteredRouter>;
    icon?: React.ElementType;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="grid grid-cols-[1fr_auto] gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 flex-1 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <EnvelopeIcon />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuLink
                tooltip={item.title}
                to={item.to}
                activeProps={{ className: "bg-sidebar-accent" }}
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
