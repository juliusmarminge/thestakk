import {
  ArrowLeftEndOnRectangleIcon,
  EllipsisVerticalIcon,
  UserCircleIcon,
} from "@heroicons/react/16/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { authClient, sessionQueryOptions } from "~/auth/client";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { buttonVariants } from "~/components/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "~/components/ui/menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session, isLoading } = useQuery(sessionQueryOptions);
  const qc = useQueryClient();
  const navigate = useNavigate();
  if (isLoading) {
  }

  if (!session) {
    return (
      <SidebarMenu>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          render={
            <Link
              className={buttonVariants({ variant: "outline" })}
              to="/login"
            />
          }
        >
          Sign in
        </SidebarMenuButton>
      </SidebarMenu>
    );
  }

  const UserAvatar = (
    <Avatar className="h-8 w-8 rounded-lg in-[.theme-mono]:grayscale">
      <AvatarImage
        src={session.user.image ?? undefined}
        alt={session.user.name}
      />
      <AvatarFallback className="rounded-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-6 fill-current"
        >
          <title>User Avatar</title>
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" />
          <path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
        </svg>
      </AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            render={<SidebarMenuButton size="lg" />}
          >
            {UserAvatar}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{session.user.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {session.user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </MenuTrigger>
          <MenuPopup
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <MenuGroup>
              <MenuGroupLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  {UserAvatar}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {session.user.name}
                    </span>
                    <span className="truncate text-muted-foreground text-xs">
                      {session.user.email}
                    </span>
                  </div>
                </div>
              </MenuGroupLabel>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup>
              <MenuItem render={<Link to="/account" />}>
                <UserCircleIcon />
                Account
              </MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem
              onClick={() => {
                void authClient
                  .signOut()
                  .then(() => qc.invalidateQueries())
                  .then(() => navigate({ to: "/login" }));
              }}
            >
              <ArrowLeftEndOnRectangleIcon />
              Log out
            </MenuItem>
          </MenuPopup>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
