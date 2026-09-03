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
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
});
