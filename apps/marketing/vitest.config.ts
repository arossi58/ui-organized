import { defineConfig } from "vitest/config";

// The marketing app's only unit tests are the pure lattice math (SITE.md §4) —
// no DOM, so the node environment is enough. Kept separate from vite.config.ts
// so the build config stays free of test concerns.
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
