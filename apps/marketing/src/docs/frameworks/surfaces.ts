/**
 * Which framework ships which component — read out of the packages themselves.
 *
 * The four libraries move at different rates, and the docs site has to be honest
 * about where each one is this week — Svelte and Vue reached React's component
 * set in the wave-7 port, Angular ships all of them too, and the data table now
 * ships for all four, though Angular's is deliberately thinner (see below).
 *
 * So nothing here is a list of component names. Each package's own public barrel
 * is read as source and its value exports are the coverage set: add `Meter` to
 * `packages/vue/src/index.ts` and the Meter page grows a Vue sample with no edit
 * to this file, and remove one and the page stops claiming it. A hand-kept list
 * would be wrong within a week and wrong silently, which is the one failure this
 * feature cannot afford — the entire point of the switcher is that the label on
 * a snippet is true.
 *
 * ── Two barrels per framework ───────────────────────────────────────────────
 *
 * The data table is a separate package per framework, so a surface is the union
 * of the library barrel and the table barrel. React gets that union for free:
 * its surface is the manifest, and the scanner already carries
 * `@ui-organized/react-table` as a second scan root. The other three read
 * barrels directly, so until they read the table barrel too, every table
 * component resolved to `undefined` and the page reported it "not available"
 * while the package shipped it — the exact silent wrongness this file exists to
 * prevent, aimed at the one framework whose surface is built differently.
 *
 * The globs are `?raw`, so nothing here imports Svelte, Vue or Angular code — a
 * React app cannot execute any of it, and does not need to in order to read what
 * a barrel exports. A package that is missing entirely globs to nothing and its
 * coverage is empty, which reads on the page as "not available" rather than as a
 * build failure.
 */

import {
  parseAngularInputs,
  parseAngularSelectors,
  parseBarrelExports,
  resolveTarget,
  type DocFramework,
  type FrameworkSurface,
  type FrameworkTarget,
} from "@ui-organized/code-connect/browser";
import { docsComponents, manifest } from "../registry";

// The options have to be an inline object literal — Vite parses these calls
// statically and cannot follow a shared constant.
const svelteBarrel = import.meta.glob<string>("../../../../../packages/svelte/src/lib/index.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});
const vueBarrel = import.meta.glob<string>("../../../../../packages/vue/src/index.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});
const angularBarrel = import.meta.glob<string>(
  "../../../../../packages/angular/src/public-api.ts",
  { query: "?raw", import: "default", eager: true },
);

const svelteTableBarrel = import.meta.glob<string>(
  "../../../../../packages/svelte-table/src/lib/index.ts",
  { query: "?raw", import: "default", eager: true },
);
const vueTableBarrel = import.meta.glob<string>("../../../../../packages/vue-table/src/index.ts", {
  query: "?raw",
  import: "default",
  eager: true,
});
const angularTableBarrel = import.meta.glob<string>(
  "../../../../../packages/angular-table/src/public-api.ts",
  { query: "?raw", import: "default", eager: true },
);

// The directive sources, not just the barrel. Angular's components are attribute
// directives on the caller's own element, so a sample needs to know that
// `UioButton` is written `<button uioButton>` and `UioTag` is a `<span>` — and
// which props each one actually declares, since the port is partial in props as
// well as in components.
const angularSources = import.meta.glob<string>(
  ["../../../../../packages/angular/src/lib/*/*.ts", "!**/*.spec.ts"],
  { query: "?raw", import: "default", eager: true },
);

// Same reason, and the same two lookups, for the table package — `resolveTarget`
// drops any Angular class it cannot find a selector for, so a barrel read
// without its sources resolves to nothing at all rather than to a sample.
//
// The depths differ from the library above: angular-table keeps its parts in
// `lib/components/*.ts` and `lib/core/*.ts` and `UioDataTable` in `lib/*.ts`,
// where the library is uniformly `lib/*/*.ts`. Both patterns are needed or the
// wrapper — the one component most readers want a sample of — goes missing.
const angularTableSources = import.meta.glob<string>(
  [
    "../../../../../packages/angular-table/src/lib/*.ts",
    "../../../../../packages/angular-table/src/lib/*/*.ts",
    "!**/*.spec.ts",
  ],
  { query: "?raw", import: "default", eager: true },
);

const allAngularSources = [...Object.values(angularSources), ...Object.values(angularTableSources)];

function exportsOf(modules: Record<string, string>): string[] {
  return Object.values(modules).flatMap(parseBarrelExports);
}

export const frameworkSurfaces: Record<DocFramework, FrameworkSurface> = {
  // React's surface is the manifest — the scanned record of what the package
  // really exports, which is the same evidence every other page element uses.
  //
  // Minus the deprecated entries. The manifest keeps a renamed or withdrawn
  // component so its docs page can say so, and `reconcile()` marks it rather
  // than dropping it; unfiltered, that made the switcher claim React "ships"
  // `Badge`, `Separator`, `ToolbarButton` and the two old filter names. The
  // other three surfaces read live barrels and cannot make that mistake, so
  // React was the one framework whose coverage was not honest.
  react: {
    exports: manifest.components
      .filter((component) => component.status !== "deprecated")
      .map((component) => component.codeName),
  },
  svelte: { exports: [...exportsOf(svelteBarrel), ...exportsOf(svelteTableBarrel)] },
  vue: { exports: [...exportsOf(vueBarrel), ...exportsOf(vueTableBarrel)] },
  angular: {
    exports: [...exportsOf(angularBarrel), ...exportsOf(angularTableBarrel)],
    selectors: parseAngularSelectors(allAngularSources),
    inputs: parseAngularInputs(allAngularSources),
  },
};

/**
 * How a component is written in one framework, or `undefined` when that
 * framework does not ship it.
 *
 * Callers must render the `undefined` case as "not available", never as a
 * fallback: a React sample under a Svelte heading is worse than no sample,
 * because a reader has no way to tell it is wrong.
 */
export function targetFor(
  framework: DocFramework,
  codeName: string | undefined,
): FrameworkTarget | undefined {
  if (!codeName) return undefined;
  return resolveTarget(framework, codeName, frameworkSurfaces[framework]);
}

export interface FrameworkCoverage {
  /** Documented components this framework ships. */
  covered: number;
  /** Documented components with a resolved code identity at all. */
  total: number;
}

/** Counted from the live registry, so the sentence on the page can't go stale. */
export function coverageOf(framework: DocFramework): FrameworkCoverage {
  const documented = docsComponents.filter((c) => c.codeName);
  return {
    covered: documented.filter((c) => targetFor(framework, c.codeName)).length,
    total: documented.length,
  };
}
