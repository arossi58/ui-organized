import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/**
 * Library build.
 *
 * Everything except the SFC compilation is externalised: Vue, Ark, and the
 * workspace packages all resolve from the consumer's install, so this package
 * ships its own components and nothing else. `cssCodeSplit` is off because the
 * component stylesheets belong to @ui-organized/core and are imported from
 * there — Vite must not try to emit copies of them here.
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: [
        "vue",
        "clsx",
        /^@ark-ui\/vue/,
        /^@ui-organized\//,
      ],
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
