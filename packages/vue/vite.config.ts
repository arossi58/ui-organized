import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

/**
 * Library build.
 *
 * Everything except the SFC compilation is externalised: Vue, Ark, the icon
 * libraries and the workspace packages all resolve from the consumer's install,
 * so this package ships its own components and nothing else. `cssCodeSplit` is
 * off because the component stylesheets belong to @ui-organized/core and are
 * imported from there — Vite must not try to emit copies of them here.
 *
 * There are four entries rather than one because each icon adapter is its own
 * subpath: `@ui-organized/vue/icons/lucide` has to be a file a consumer can
 * import on its own, and bundling them into `index.js` would make all three
 * optional peers mandatory for everyone. Rollup lifts what they share — the
 * registry — into a chunk, which keeps a single registry instance across them.
 */
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      // Keyed by output path, matching the source file names so that each
      // entry's `.js` and the `.d.ts` vue-tsc emits next to it stay side by side.
      entry: {
        index: resolve(import.meta.dirname, "src/index.ts"),
        "icons/entry-lucide": resolve(import.meta.dirname, "src/icons/entry-lucide.ts"),
        "icons/entry-tabler": resolve(import.meta.dirname, "src/icons/entry-tabler.ts"),
        "icons/entry-heroicons": resolve(import.meta.dirname, "src/icons/entry-heroicons.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: [
        "vue",
        "clsx",
        /^@ark-ui\/vue/,
        /^@ui-organized\//,
        /^@lucide\/vue/,
        /^@tabler\/icons-vue/,
        /^@heroicons\/vue/,
      ],
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
