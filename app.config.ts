import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";

export default defineConfig({
  server: {
    // preset: "node-server",
    preset: "aws-lambda",
    // preset: "vercel",
    awsLambda: {
      streaming: true,
    },
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
