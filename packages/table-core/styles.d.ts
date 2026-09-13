/**
 * Types for the `@ui-organized/table-core/styles` (and `/styles.css`) subpath.
 *
 * The subpath resolves to a stylesheet, which TypeScript cannot describe — so
 * without this file `import "@ui-organized/table-core/styles"` fails typecheck
 * with TS2307. This declares it as a module with no exports, which is exactly
 * what a side-effect import needs.
 */
export {};
