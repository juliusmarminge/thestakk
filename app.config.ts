import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";

export default defineConfig({
  server: {
    preset: "vercel",
  },
  vite: {
    resolve: {
      alias: {
        "~": path.resolve(import.meta.dirname, "./app"),
      },
    },
    plugins: [tailwindcss() as any],
  },
  react: {
    exclude: [/packages/],
  },
});
