/**
 * Types for the `@ui-organized/react/styles` (and `/styles.css`) subpath.
 *
 * The subpath resolves to a stylesheet, which TypeScript cannot describe — so
 * without this file `import "@ui-organized/react/styles"` fails typecheck with
 * TS2307 and every consumer has to write their own `declare module` shim. This
 * declares it as a module with no exports, which is exactly what a side-effect
 * import needs.
 */
export {};
