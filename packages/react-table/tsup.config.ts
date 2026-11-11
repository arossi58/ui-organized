import { defineConfig } from "tsup";

/**
 * One entry. `@ui-organized/react` and React itself externalise from
 * peerDependencies automatically — two copies of the design system in one tree
 * would mean duplicated global CSS and duplicated Ark context.
 *
 * `@ui-organized/table-core` is a real dependency and therefore also external,
 * which for its stylesheet import would mean `dist/index.css` came out empty.
 * Pulling only the CSS subpath back in re-exports core's stylesheet under
 * `@ui-organized/react-table/styles`, so a consumer imports one path, not two;
 * the JS API stays external so the behaviours are not duplicated into this
 * bundle.
 */
export default defineConfig((options) => ({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  external: ["react", "react-dom", "@ui-organized/react"],
  noExternal: [/^@ui-organized\/table-core\/styles/],
  splitting: false,
  sourcemap: false,
  // Clean only for one-off builds. A watcher that wipes dist on start races
  // every package reading it: under `pnpm dev` all watchers start together, and
  // a dependent whose first build lands in that gap fails and stays broken until
  // one of its own files changes. Watch builds overwrite in place instead.
  clean: !options.watch,
}));
