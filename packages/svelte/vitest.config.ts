import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    // Components are authored against the same entry a consumer would use, so
    // the tests exercise the real export conditions rather than source paths.
    conditions: ["browser", "svelte", "import"],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
