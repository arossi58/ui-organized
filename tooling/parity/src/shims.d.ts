/**
 * Ambient module declarations for the Svelte and Vue fixtures.
 *
 * Neither framework ships a wildcard declaration that a plain `tsc` run picks
 * up — the real types come from `svelte-check` and `vue-tsc`, which understand
 * the single-file component formats and which this package deliberately does
 * not run: the fixtures are test inputs, and the components they exercise are
 * already type-checked inside their own packages.
 *
 * What is left for `tsc` here is the *test* code, and it treats every fixture
 * the same way — as an opaque component handed straight to a renderer. So the
 * declarations are deliberately loose. Nothing is lost: `cases.tsx` casts each
 * fixture to `ComponentType<any>` regardless, because the three renderers'
 * component types have no common supertype.
 */

declare module "*.svelte" {
  const component: import("svelte").Component<Record<string, any>>;
  export default component;
}

declare module "*.vue" {
  const component: import("vue").Component;
  export default component;
}
