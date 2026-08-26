/**
 * Which framework ships which component — read out of the packages themselves.
 *
 * The four libraries are at different stages: React has every component, Svelte
 * and Vue have a couple of dozen, Angular fewer still. That is the fact the docs
 * site has to be honest about, and it moves every week.
 *
 * So nothing here is a list of component names. Each package's own public barrel
 * is read as source and its value exports are the coverage set: add `Meter` to
 * `packages/vue/src/index.ts` and the Meter page grows a Vue sample with no edit
 * to this file, and remove one and the page stops claiming it. A hand-kept list
 * would be wrong within a week and wrong silently, which is the one failure this
 * feature cannot afford — the entire point of the switcher is that the label on
 * a snippet is true.
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

// The directive sources, not just the barrel. Angular's components are attribute
// directives on the caller's own element, so a sample needs to know that
// `UioButton` is written `<button uioButton>` and `UioTag` is a `<span>` — and
// which props each one actually declares, since the port is partial in props as
// well as in components.
const angularSources = import.meta.glob<string>(
  ["../../../../../packages/angular/src/lib/*/*.ts", "!**/*.spec.ts"],
  { query: "?raw", import: "default", eager: true },
);

function exportsOf(modules: Record<string, string>): string[] {
  return Object.values(modules).flatMap(parseBarrelExports);
}

export const frameworkSurfaces: Record<DocFramework, FrameworkSurface> = {
  // React's surface is the manifest — the scanned record of what the package
  // really exports, which is the same evidence every other page element uses.
  react: { exports: manifest.components.map((c) => c.codeName) },
  svelte: { exports: exportsOf(svelteBarrel) },
  vue: { exports: exportsOf(vueBarrel) },
  angular: {
    exports: exportsOf(angularBarrel),
    selectors: parseAngularSelectors(Object.values(angularSources)),
    inputs: parseAngularInputs(Object.values(angularSources)),
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
