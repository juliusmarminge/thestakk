import { ThemeColorMap } from "@tanstack-themes/react";
import * as Schema from "effect/Schema";

export const ThemeVariant = Schema.Literal(
  "default",
  "amber",
  "sapphire",
  "emerald",
  "mono",
);

declare module "@tanstack-themes/react" {
  interface Register {
    variant: typeof ThemeVariant.Type;
  }
}

export const themeColorMap: ThemeColorMap = {
  "amber-dark": "",
  "amber-light": "",
  "default-dark": "",
  "default-light": "",
  "sapphire-dark": "",
  "sapphire-light": "",
  "emerald-dark": "",
  "emerald-light": "",
  "mono-dark": "",
  "mono-light": "",
};
