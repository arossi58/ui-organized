import { defineConfig } from "tsup";

/**
 * One entry, two outputs that matter: `dist/index.mjs` (the framework-free API)
 * and `dist/index.css` (the whole table stylesheet).
 *
 * The CSS falls out of `src/index.ts` side-effect-importing each stylesheet in
 * cascade order — the same mechanism `@ui-organized/react` uses. esbuild strips
 * those imports from the JS bundle and concatenates them into one file, which is
 * what lets a plain Node script import this package without a CSS loader.
 */
export default defineConfig((options) => ({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: false,
  // Clean only for one-off builds. A watcher that wipes dist on start races
  // every package reading it: under `pnpm dev` all watchers start together, and
  // a dependent whose first build lands in that gap fails and stays broken until
  // one of its own files changes. Watch builds overwrite in place instead.
  clean: !options.watch,
}));
