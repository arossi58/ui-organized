import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    // Both libraries are resolved the way a consumer resolves them, through
    // their published export conditions — the point of this package is to test
    // what ships, not what is in src/.
    conditions: ["browser", "svelte", "import"],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
