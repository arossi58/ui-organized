// Side-effect CSS imports (the design system stylesheets) — bundled by esbuild,
// no types needed.
declare module "*.css";
// `@ui-organized/react/styles` needs no shim — the package ships types for the
// subpath itself (packages/react/styles.d.ts).
