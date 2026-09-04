import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/**
 * Library build.
 *
 * One entry, unlike `@ui-organized/vue`'s four: this package has no optional
 * icon adapters to keep on their own subpaths, so there is nothing to split.
 *
 * Everything except the SFC compilation is externalised — Vue, TanStack and the
 * workspace packages all resolve from the consumer's install. `cssCodeSplit` is
 * off for the reason the component package gives: the stylesheets belong to
 * `@ui-organized/table-core` and are imported from there, and Vite must not emit
 * copies of them here.
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: { index: resolve(import.meta.dirname, "src/index.ts") },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ["vue", "clsx", /^@tanstack\//, /^@ui-organized\//],
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
