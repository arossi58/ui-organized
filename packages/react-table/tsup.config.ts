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
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  external: ["react", "react-dom", "@ui-organized/react"],
  noExternal: [/^@ui-organized\/table-core\/styles/],
  splitting: false,
  sourcemap: false,
  clean: true,
});
