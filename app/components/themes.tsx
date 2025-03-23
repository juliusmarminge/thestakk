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
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

const MODE_COOKIE_NAME = "mode";
const THEME_COOKIE_NAME = "theme";

const Mode = type('"light" | "dark" | "system"');
const PrefersMode = type('"light" | "dark"');
const Theme = type('"default" | "blue" | "green" | "amber" | "mono"');
const themeValues = ["default", "blue", "green", "amber", "mono"];

interface ThemeStore {
  resolvedMode: typeof Mode.infer;
  preferredMode: typeof PrefersMode.infer;
  toggleMode: () => void;
  setPreferredMode: (mode: typeof PrefersMode.infer) => void;
  activeTheme: typeof Theme.infer;
  setActiveTheme: (theme: typeof Theme.infer, scaled: boolean) => void;
  scaled: boolean;
}

export const getModeCookie = createServerFn().handler(() => {
  let resolved = Mode(getCookie(MODE_COOKIE_NAME) ?? "null");
  if (resolved instanceof ArkErrors) resolved = "system";
  return resolved;
});

export const getThemeCookie = createServerFn().handler(() => {
  const [theme = "default", scaled] = (getCookie(THEME_COOKIE_NAME) ?? "null").split("-");
  let resolved = Theme(theme);
  if (resolved instanceof ArkErrors) resolved = "default";
  return { theme: resolved, scaled: !!scaled };
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
  .validator(type("string"))
  .handler((ctx) => {
    setCookie(THEME_COOKIE_NAME, ctx.data, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
    });
  });

// Helper to update <body> class
function updateThemeClass(mode: typeof Mode.infer, prefers: typeof PrefersMode.infer) {
  document.documentElement.classList.remove("dark");
  if (mode === "dark" || (mode === "system" && prefers === "dark")) {
    document.documentElement.classList.add("dark");
  }
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
  resolvedMode: "system",
  preferredMode: (() => {
    if (typeof document !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    return "light";
  })(),
  toggleMode: () =>
    set((s) => {
      const newMode =
        s.resolvedMode === "system" ? "light" : s.resolvedMode === "light" ? "dark" : "system";

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

  activeTheme: "default",
  scaled: false,
  setActiveTheme: (theme, scaled) => {
    set({ activeTheme: theme, scaled });

    updateThemeCookie({ data: `${theme}${scaled ? "-scaled" : ""}` });
    for (const className of Array.from(document.body.classList)) {
      if (className.startsWith("theme-")) {
        document.body.classList.remove(className);
      }
    }
    document.body.classList.add(`theme-${theme}`);
    if (scaled) {
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
        "relative flex aspect-[2/1] h-6 cursor-pointer items-center rounded-md bg-accent transition-all",
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
      {mounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <span className="hidden text-muted-foreground sm:block">Select a theme:</span>
              <span className="block text-muted-foreground sm:hidden">Theme</span>
              <span className="capitalize">{activeTheme}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={activeTheme}
                onValueChange={(value) => setActiveTheme(value as typeof Theme.infer, scaled)}
              >
                {themeValues.map((theme) => (
                  <DropdownMenuRadioItem key={theme} value={theme} className="capitalize">
                    {theme}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuCheckboxItem
                checked={scaled}
                onCheckedChange={(checked) => setActiveTheme(activeTheme, checked)}
              >
                Scaled
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Skeleton className="h-9 w-44" />
      )}
    </div>
  );
}
