import { ModeToggle, ThemeSelector } from "~/components/themes";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

export function SiteHeader() {
  const { side, setSide } = useSidebar();

  return (
    <header
      style={
        {
          "--header-height": "calc(var(--spacing) * 12 + 1px)",
        } as React.CSSProperties
      }
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <ContextMenu>
          <ContextMenuTrigger>
            <SidebarTrigger className="-ml-1" />
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Sidebar Location</ContextMenuLabel>
            <ContextMenuRadioGroup
              value={side}
              onValueChange={(value) => setSide(value as "left" | "right")}
            >
              <ContextMenuRadioItem value="left">Left</ContextMenuRadioItem>
              <ContextMenuRadioItem value="right">Right</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="font-medium text-base">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/juliusmarminge/thestakk"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
          <ThemeSelector />
          <ModeToggle className="h-9" />
        </div>
      </div>
    </header>
  );
}
