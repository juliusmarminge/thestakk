import type { ThemeColorMap } from "@tanstack-themes/react";
import * as Schema from "effect/Schema";

export const ThemeBase = Schema.Literal("neutral", "stone", "slate", "zinc");

export const ThemeAccent = Schema.Literal(
  "default",
  "amber",
  "sapphire",
  "emerald",
  "mono",
);

declare module "@tanstack-themes/react" {
  interface Register {
    base: typeof ThemeBase.Type;
    accent: typeof ThemeAccent.Type;
  }
}

export const themeColorMap: ThemeColorMap = {
  "neutral-light": "#FFFFFF",
  "neutral-dark": "#000000",
  "stone-light": "#FFFFFF",
  "stone-dark": "#000000",
  "slate-light": "#FFFFFF",
  "slate-dark": "#000000",
  "zinc-light": "#FFFFFF",
  "zinc-dark": "#000000",
};
