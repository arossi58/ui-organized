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
 * declarations are deliberately loose. Nothing is lost: every case module in
 * `cases/` casts its fixtures to `ComponentType<any>` regardless, because the
 * three renderers' component types have no common supertype.
 */

/**
 * And `import.meta.glob`, which `cases/index.ts` uses to collect the case
 * modules. Vite implements it; `tsc` only knows about it from this reference.
 */
/// <reference types="vite/client" />

declare module "*.svelte" {
  const component: import("svelte").Component<Record<string, any>>;
  export default component;
}

declare module "*.vue" {
  const component: import("vue").Component;
  export default component;
}

/**
 * `pixelmatch` v6 ships no type declarations and has no `@types` package on the
 * v6 line — only v5 does, and downgrading a comparator to get a `.d.ts` is the
 * wrong trade. The signature below is the whole of its public API, taken from
 * its README, and it is used in exactly one place: the visual gate in
 * `browser/visual.browser.spec.ts`.
 */
declare module "pixelmatch" {
  export default function pixelmatch(
    img1: Uint8Array | Uint8ClampedArray,
    img2: Uint8Array | Uint8ClampedArray,
    output: Uint8Array | Uint8ClampedArray | null,
    width: number,
    height: number,
    options?: {
      threshold?: number;
      includeAA?: boolean;
      alpha?: number;
      aaColor?: [number, number, number];
      diffColor?: [number, number, number];
      diffColorAlt?: [number, number, number];
      diffMask?: boolean;
    },
  ): number;
}
