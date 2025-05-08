import { join } from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import * as reactHooks from "eslint-plugin-react-hooks";
import * as tseslint from "typescript-eslint";

export default tseslint.config(
  includeIgnoreFile(join(import.meta.dirname, ".gitignore")),
  {
    ignores: ["app/routeTree.gen.ts", "convex/_generated/**", "sst-env.d.ts"],
  },
  // This just adds necessary configs to lint typescript files
  // Consider extending a recommended rule set if you want "actual linting"
  tseslint.configs.base,
  reactHooks.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "react-hooks/react-compiler": "warn",
    },
  },
);
