import { defineConfig } from "tsup";

/**
 * Two entries, and the split is load-bearing.
 *
 * `cli` is the bin and executes on import; `index` is the library and never
 * does. They were one module once, told apart by an entry-point guard — which
 * npm's bin symlinks defeated, shipping a CLI that silently did nothing. See
 * `src/cli.ts`.
 *
 * ESM only. The bin is meant to be run as `npx @ui-organized/cli`, so startup
 * cost is user-visible: no dependencies to resolve, one small file to load.
 */
export default defineConfig({
  entry: { index: "src/index.ts", cli: "src/cli.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  // No `banner` here: a tsup banner applies to every entry, and a stray `#!` at
  // the top of the library would be wrong. The shebang lives at the top of
  // `src/cli.ts` instead, which esbuild preserves for that entry alone.
});
