import { MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  setVariant,
  toggleMode,
  useTheme,
  type Register,
} from "@tanstack-themes/react";
import { ThemeVariant } from "~/lib/themes";

export function ModeToggle(props: { className?: string }) {
  const mode = useTheme((s) => s.themeMode);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleMode = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMode();
  };

  return (
    <button
      onClick={handleToggleMode}
      className={cn(
        "relative flex aspect-2/1 h-6 cursor-pointer items-center rounded-md bg-accent",
        props.className,
      )}
    >
      {mounted && (
        <>
          <div className="flex flex-1 items-center justify-between px-1.5">
            <SunIcon
              className={cn(
                "size-4 text-sm transition-opacity",
                mode !== "auto" ? "opacity-50" : "opacity-0",
              )}
            />
            <MoonIcon
              className={cn(
                "size-4 text-sm transition-opacity",
                mode !== "auto" ? "opacity-50" : "opacity-0",
              )}
            />
            <span
              className={cn(
                "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 select-none font-black text-[.6rem] uppercase transition-opacity",
                mode === "auto" ? "opacity-30 hover:opacity-50" : "opacity-0",
              )}
            >
              Auto
            </span>
          </div>
          <div
            data-slot="theme-toggle-knob"
            className="absolute aspect-square h-full rounded-full bg-white shadow-black/20 shadow-md transition-all! duration-300 ease-in-out dark:bg-accent-foreground"
            style={{
              left: mode === "auto" ? "50%" : mode === "light" ? "100%" : "0%",
              transform: `translateX(${
                mode === "auto" ? "-50%" : mode === "light" ? "-100%" : "0"
              }) scale(${mode === "auto" ? 0 : 0.8})`,
            }}
          />
        </>
      )}
    </button>
  );
}

export function ThemeSelector() {
  const activeTheme = useTheme((s) => s.variant);
  const baseColor = "neutral";

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <span className="hidden text-muted-foreground sm:block">
              Select a theme:
            </span>
            <span className="block text-muted-foreground sm:hidden">Theme</span>
            <span className="min-w-[15ch] capitalize">
              <Skeleton loading={!mounted}>
                {activeTheme} {baseColor}
              </Skeleton>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeTheme}
              onValueChange={(value) =>
                setVariant(value as Register["variant"])
              }
            >
              {ThemeVariant.literals.map((theme) => {
                return (
                  <DropdownMenuRadioItem
                    key={theme}
                    value={theme}
                    className="capitalize"
                  >
                    {theme}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ThemePreview() {
  const activeTheme = useTheme((s) => s.variant);
  const baseColor = "neutral";

  return (
    <RadioGroup
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      value={`${baseColor}-${activeTheme}`}
      onValueChange={(value) => {
        const [_baseColor, activeTheme] = value.split("-");
        setVariant(activeTheme as Register["variant"]);
      }}
    >
      {(
        [
          { baseColor: "neutral", activeTheme: "default" },
          { baseColor: "stone", activeTheme: "amber" },
          { baseColor: "slate", activeTheme: "sapphire" },
          { baseColor: "zinc", activeTheme: "emerald" },
          { baseColor: "neutral", activeTheme: "mono" },
        ] as const
      ).map(({ baseColor, activeTheme }) => {
        const key = `${baseColor}-${activeTheme}`;
        return (
          <div key={key} className="group/theme-card">
            <RadioGroupItem value={key} id={key} className="peer sr-only" />
            <Label htmlFor={`${baseColor}-${activeTheme}`} className="block">
              <Card
                className={cn(
                  "transition-colors hover:bg-accent/50 group-has-data-[state=checked]/theme-card:border-primary",
                )}
              >
                <CardHeader>
                  <CardTitle className="capitalize">{activeTheme}</CardTitle>
                  <CardDescription>Click to select this theme</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Mini App Skeleton */}
                  <div
                    className={cn(
                      "flex h-[100px] overflow-hidden rounded-md border",
                      `theme-${activeTheme}`,
                      `theme-${baseColor}`,
                    )}
                  >
                    {/* Sidebar */}
                    <div className="w-16 border-r bg-sidebar p-2">
                      <div className="mb-2 h-3 w-full rounded-md bg-sidebar-accent" />
                      <div className="h-3 w-full rounded-md bg-sidebar-accent" />
                    </div>
                    {/* Main Content */}
                    <div className="flex-1 bg-background p-2">
                      {/* Header */}
                      <div className="mb-2 h-3 w-1/3 rounded-md bg-primary" />
                      {/* Content */}
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded-md bg-muted" />
                        <div className="h-3 w-4/5 rounded-md bg-muted" />
                        <div className="h-3 w-2/3 rounded-md bg-muted" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
