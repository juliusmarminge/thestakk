"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { useThemeStore } from "~/components/themes";

const Toaster = ({ ...props }: ToasterProps) => {
  const mode = useThemeStore((s) => s.resolvedMode);

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
