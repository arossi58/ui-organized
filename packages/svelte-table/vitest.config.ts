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
    // `*.test.svelte.ts`, not `*.test.ts`: a test that drives runes has to be
    // compiled by the Svelte plugin, and the plugin claims files by the
    // `.svelte.ts` suffix. Naming it the other way round leaves `$state` and
    // `$effect` as undefined globals.
    include: ["src/**/*.test.ts", "src/**/*.test.svelte.ts"],
    globals: false,
  },
});
