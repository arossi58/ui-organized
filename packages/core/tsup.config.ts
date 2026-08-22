import { defineConfig } from "tsup";

/**
 * Two entries, because this package ships two different kinds of thing.
 *
 * `index` is the JavaScript API — cva variant recipes and pure helpers. It is
 * imported by every framework package and must stay free of DOM and framework
 * references.
 *
 * `styles` exists only for its side effects: it imports every component
 * stylesheet in cascade order, so esbuild emits `dist/styles.css` as one
 * bundle. This is deliberately the *same mechanism* `@ui-organized/react` uses
 * to produce its own `dist/index.css` — same bundler, same ordering semantics —
 * rather than a hand-rolled concatenator that could drift from it. The
 * near-empty `dist/styles.mjs` it also emits is unused and harmless.
 *
 * Raw per-component CSS is copied into `dist/components/**` separately by
 * `scripts/build-css.mjs`, because bundlers cannot do that and the framework
 * packages import those files individually to keep CSS tree-shakeable.
 */
export default defineConfig({
  entry: {
    index: "src/index.ts",
    styles: "src/styles.ts",
  },
  format: ["esm", "cjs"],
  dts: { entry: "src/index.ts" },
  splitting: false,
  sourcemap: false,
  clean: true,
});
