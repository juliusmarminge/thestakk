import { MoonIcon, SunIcon } from "@heroicons/react/16/solid";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { ArkErrors, type } from "arktype";
import * as React from "react";
import { create } from "zustand";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const MODE_COOKIE_NAME = "mode";
const THEME_COOKIE_NAME = "theme";
const DEFAULT_MODE = "system";
const DEFAULT_THEME = "default";
const DEFAULT_BASE_COLOR = "neutral";
const DEFAULT_SCALED = false;

const Mode = type('"light" | "dark" | "system"');
const PrefersMode = type('"light" | "dark"');
const BaseColor = type('"neutral" | "stone" | "zinc" | "slate"');
const Theme = type('"default" | "amber" | "sapphire" | "emerald" | "mono"');

export const THEME_CLASSNAMES: Record<typeof Theme.infer, string> = {
  default: "theme-default",
  amber: "theme-amber",
  sapphire: "theme-sapphire",
  emerald: "theme-emerald",
  mono: "theme-mono",
};
export const BASE_COLOR_CLASSNAMES: Record<typeof BaseColor.infer, string> = {
  neutral: "theme-neutral",
  stone: "theme-stone",
  zinc: "theme-zinc",
  slate: "theme-slate",
};

interface ThemeStore {
  resolvedMode: typeof Mode.infer;
  preferredMode: typeof PrefersMode.infer;
  toggleMode: () => void;
  setPreferredMode: (mode: typeof PrefersMode.infer) => void;
  activeTheme: typeof Theme.infer;
  baseColor: typeof BaseColor.infer;
  scaled: boolean;
  setActiveTheme: (options: {
    baseColor: typeof BaseColor.infer;
    activeTheme: typeof Theme.infer;
    scaled: boolean;
  }) => void;
}

export const getModeCookie = createServerFn().handler(() => {
  let resolved = Mode(getCookie(MODE_COOKIE_NAME));
  if (resolved instanceof ArkErrors) resolved = DEFAULT_MODE;
  return resolved;
});

export const getThemeCookie = createServerFn().handler(() => {
  const [baseColor = DEFAULT_BASE_COLOR, theme = DEFAULT_THEME, scaled] = (
    getCookie(THEME_COOKIE_NAME) ?? "null"
  ).split("-");

  let resolvedBaseColor = BaseColor(baseColor);
  if (resolvedBaseColor instanceof ArkErrors) resolvedBaseColor = DEFAULT_BASE_COLOR;

  let resolvedTheme = Theme(theme);
  if (resolvedTheme instanceof ArkErrors) resolvedTheme = DEFAULT_THEME;

  return { theme: resolvedTheme, scaled: !!scaled, baseColor: resolvedBaseColor };
});

const updateModeCookie = createServerFn({ method: "POST" })
  .validator(Mode)
  .handler((ctx) => {
    setCookie(MODE_COOKIE_NAME, ctx.data, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  });

const updateThemeCookie = createServerFn({ method: "POST" })
  .validator(
    type({
      baseColor: BaseColor,
      activeTheme: Theme,
      scaled: "boolean",
    }),
  )
  .handler(({ data }) => {
    const cookie = `${data.baseColor}-${data.activeTheme}${data.scaled ? "-scaled" : ""}`;
    setCookie(THEME_COOKIE_NAME, cookie, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  });

// Helper to update <body> class
function updateThemeClass(mode: typeof Mode.infer, prefers: typeof PrefersMode.infer) {
  // Add a style element to disable animations during theme transition
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(css);

  console.trace("updateThemeClass", mode, prefers);

  document.documentElement.classList.remove("dark");
  if (mode === "dark" || (mode === "system" && prefers === "dark")) {
    document.documentElement.classList.add("dark");
  }

  // Force restyle
  window.getComputedStyle(document.body);

  // Wait for next tick before removing
  setTimeout(() => document.head.removeChild(css), 1);
}

export const EAGER_SET_SYSTEM_THEME_SCRIPT = `
(function() {
  const mode = document.cookie.split('; ').find(row => row.startsWith('mode='))?.split('=')[1];
  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
})();
`;

export const useThemeStore = create<ThemeStore>((set, get) => ({
  resolvedMode: DEFAULT_MODE,
  preferredMode: (() => {
    if (typeof document !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return "light";
  })(),
  toggleMode: () =>
    set((s) => {
      const newMode = (
        {
          system: "light",
          light: "dark",
          dark: "system",
        } as const
      )[s.resolvedMode];

      updateThemeClass(newMode, s.preferredMode);
      updateModeCookie({ data: newMode });

      return {
        resolvedMode: newMode,
      };
    }),
  setPreferredMode: (preferredMode) => {
    set({ preferredMode });
    updateThemeClass(get().resolvedMode, preferredMode);
  },

  activeTheme: DEFAULT_THEME,
  baseColor: DEFAULT_BASE_COLOR,
  scaled: DEFAULT_SCALED,
  setActiveTheme: (input) => {
    set(input);

    updateThemeCookie({ data: input });
    for (const className of Array.from(document.body.classList)) {
      if (className.startsWith("theme-")) {
        document.body.classList.remove(className);
      }
    }
    document.body.classList.add(`theme-${input.baseColor}`);
    document.body.classList.add(`theme-${input.activeTheme}`);
    if (input.scaled) {
      document.body.classList.add("theme-scaled");
    }
  },
}));

export function useSystemTheme() {
  React.useEffect(() => {
    const match = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(event: MediaQueryListEvent) {
      if (useThemeStore.getState().resolvedMode === "system") {
        useThemeStore.getState().setPreferredMode(event.matches ? "dark" : "light");
      }
    }
    match.addEventListener("change", handleChange);
    return () => match.removeEventListener("change", handleChange);
  }, []);

  return null;
}

export function ModeToggle(props: {
  className?: string;
}) {
  const mode = useThemeStore((s) => s.resolvedMode);
  const toggleMode = useThemeStore((s) => s.toggleMode);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleMode = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMode();
  };

  return (
    <button
      onClick={handleToggleMode}
      className={cn(
        "relative flex aspect-[2/1] h-6 cursor-pointer items-center rounded-md bg-accent",
        props.className,
      )}
    >
      {mounted && (
        <>
          <div className="flex flex-1 items-center justify-between px-1.5">
            <SunIcon
              className={cn(
                "size-4 text-sm transition-opacity",
                mode !== "system" ? "opacity-50" : "opacity-0",
              )}
            />
            <MoonIcon
              className={cn(
                "size-4 text-sm transition-opacity",
                mode !== "system" ? "opacity-50" : "opacity-0",
              )}
            />
            <span
              className={cn(
                "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 select-none font-black text-[.6rem] uppercase transition-opacity",
                mode === "system" ? "opacity-30 hover:opacity-50" : "opacity-0",
              )}
            >
              Auto
            </span>
          </div>
          <div
            data-slot="theme-toggle-knob"
            className="absolute aspect-square h-full rounded-full bg-white shadow-black/20 shadow-md transition-all duration-300 ease-in-out dark:bg-accent-foreground"
            style={{
              left: mode === "system" ? "50%" : mode === "light" ? "100%" : "0%",
              transform: `translateX(${
                mode === "system" ? "-50%" : mode === "light" ? "-100%" : "0"
              }) scale(${mode === "system" ? 0 : 0.8})`,
            }}
          />
        </>
      )}
    </button>
  );
}

export function ThemeSelector() {
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const baseColor = useThemeStore((s) => s.baseColor);
  const scaled = useThemeStore((s) => s.scaled);
  const setActiveTheme = useThemeStore((s) => s.setActiveTheme);

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
            <span className="hidden text-muted-foreground sm:block">Select a theme:</span>
            <span className="block text-muted-foreground sm:hidden">Theme</span>
            <span className="min-w-[15ch] capitalize">
              <Skeleton loading={!mounted}>
                {activeTheme} {baseColor}
              </Skeleton>
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Base Color</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={baseColor}
              onValueChange={(value) =>
                setActiveTheme({
                  activeTheme,
                  baseColor: value as typeof BaseColor.infer,
                  scaled,
                })
              }
            >
              {BaseColor.select("unit").map((unit) => {
                const theme = unit.serializedValue.replace(/"/g, "");
                return (
                  <DropdownMenuRadioItem key={theme} value={theme} className="capitalize">
                    {theme}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeTheme}
              onValueChange={(value) =>
                setActiveTheme({
                  activeTheme: value as typeof Theme.infer,
                  baseColor,
                  scaled,
                })
              }
            >
              {Theme.select("unit").map((unit) => {
                const theme = unit.serializedValue.replace(/"/g, "");
                return (
                  <DropdownMenuRadioItem key={theme} value={theme} className="capitalize">
                    {theme}
                  </DropdownMenuRadioItem>
                );
              })}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuCheckboxItem
              checked={scaled}
              onCheckedChange={(checked) =>
                setActiveTheme({
                  activeTheme,
                  baseColor,
                  scaled: checked,
                })
              }
            >
              Scaled
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ThemePreview() {
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const baseColor = useThemeStore((s) => s.baseColor);
  const scaled = useThemeStore((s) => s.scaled);
  const setActiveTheme = useThemeStore((s) => s.setActiveTheme);

  return (
    <RadioGroup
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      value={`${baseColor}-${activeTheme}`}
      onValueChange={(value) => {
        const [baseColor, activeTheme] = value.split("-");
        setActiveTheme({
          activeTheme: activeTheme as typeof Theme.infer,
          baseColor: baseColor as typeof BaseColor.infer,
          scaled,
        });
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
                      THEME_CLASSNAMES[activeTheme],
                      BASE_COLOR_CLASSNAMES[baseColor],
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
