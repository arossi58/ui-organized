import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

/**
 * jsdom, because the composable's interesting parts touch the DOM: the roving
 * cursor queries the viewport for a cell, the horizontal-scroll watcher attaches
 * a listener, and `useDeferred` falls back to a macrotask where there is no
 * `requestIdleCallback`. None of that is reachable in a bare Node environment.
 */
export default defineConfig({
  plugins: [vue()],
  test: { environment: "jsdom", include: ["src/**/*.test.ts"] },
});
