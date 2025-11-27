import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { devtools } from "@tanstack/devtools-vite";
import { nitro } from "nitro/vite";
import inspect from "vite-plugin-inspect";

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "#convex": path.resolve(import.meta.dirname, "./convex"),
      "~": path.resolve(import.meta.dirname, "./src"),
    },
  },
  plugins: [devtools() as never, tanstackStart(), react(), tailwindcss(), nitro(), inspect()],
});
