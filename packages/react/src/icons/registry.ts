/**
 * The icon-set registry.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `Icon` used to statically import all three icon adapters, so `dist/index.mjs`
 * carried top-level `import` statements for `lucide-react`,
 * `@tabler/icons-react` *and* `@heroicons/react`. The package declared all three
 * as optional peers, but `optional` only suppresses npm's install-time warning —
 * at bundle time every one of them was a hard requirement. A consumer using only
 * Lucide, with only Lucide installed, got 168 errors like:
 *
 *     [MISSING_EXPORT] "IconArrowDown" is not exported by
 *     "__vite-optional-peer-dep:@tabler/icons-react:@ui-organized/react"
 *
 * …for a library their app never referenced.
 *
 * So the core imports nothing. Each library lives behind its own subpath
 * (`@ui-organized/react/icons/lucide`), and importing that subpath registers it
 * here. Whatever you don't import is never resolved, which is what makes the
 * optional peer honest. It also keeps `Icon` synchronous — a dynamic `import()`
 * would have made the most common element in the system render a frame late.
 */

import type { ComponentType } from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export type IconLibrary = "lucide" | "tabler" | "heroicons";

/** Canonical name → component, for one library in one style. */
export type IconNameMap = Partial<Record<CanonicalIconName, ComponentType<any>>>;

/**
 * One library's adapter.
 *
 * `svgProps` belongs here rather than in `Icon` because the libraries disagree
 * about how they're sized and stroked — Lucide takes `size`/`strokeWidth`,
 * Tabler takes `size`/`stroke`, Heroicons take `width`/`height`/`strokeWidth`.
 * Keeping that per-adapter means a new library is a new subpath and nothing else.
 */
export interface IconSet {
  library: IconLibrary;
  /** Outline/stroke variants. Every library has these. */
  outline: IconNameMap;
  /** Solid/filled variants, where the library ships them. */
  solid?: IconNameMap;
  /** Map the resolved size and stroke onto this library's own SVG props. */
  svgProps(size: number, stroke: number | undefined): Record<string, unknown>;
}

/**
 * Keyed on `globalThis` rather than held in a module-local `Map`.
 *
 * This module is reachable from four bundle entries (the main one plus the three
 * `icons/*` subpaths). ESM code-splitting normally gives them a shared chunk, but
 * the CJS build cannot split — each entry inlines its own copy. Two copies means
 * two Maps: `icons/lucide` would register into one and `Icon` would read the
 * other, and icons would silently never render. A global key is the one storage
 * that is immune to how the bundler chose to lay the modules out.
 */
const REGISTRY_KEY = Symbol.for("@ui-organized/react.iconRegistry");

type GlobalWithRegistry = typeof globalThis & {
  [REGISTRY_KEY]?: Map<IconLibrary, IconSet>;
};

const globalRef = globalThis as GlobalWithRegistry;
const registry: Map<IconLibrary, IconSet> = (globalRef[REGISTRY_KEY] ??= new Map());

/**
 * Register an icon set. Called for its side effect by each `icons/*` subpath, so
 * `import "@ui-organized/react/icons/lucide"` is all a consumer needs.
 */
export function registerIconSet(set: IconSet): void {
  registry.set(set.library, set);
}

export function getIconSet(library: IconLibrary): IconSet | undefined {
  return registry.get(library);
}

/** Which libraries have been registered — used by the dev warning. */
export function registeredLibraries(): IconLibrary[] {
  return [...registry.keys()];
}
