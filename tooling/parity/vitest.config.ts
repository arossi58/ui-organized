import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [svelte({ hot: false }), vue()],
  resolve: {
    /**
     * Deliberately NOT "browser".
     *
     * Both sides are rendered server-side here, and forcing the browser
     * condition makes `svelte` resolve to its client internals — at which point
     * Ark's `createContext` calls the client `hasContext()` during SSR and
     * throws `lifecycle_outside_component`. The plain components did not care;
     * every Ark-backed one does.
     */
    conditions: ["svelte", "import", "node"],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
