/**
 * The icon-set registry mechanism, shared by every framework library.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `Icon` used to statically import all three icon adapters, so the bundle
 * carried top-level `import` statements for every icon library at once. The
 * package declared all three as optional peers, but `optional` only suppresses
 * npm's install-time warning — at bundle time every one of them was a hard
 * requirement, and a consumer using only Lucide got a wall of missing-export
 * errors for libraries their app never referenced.
 *
 * So the core imports nothing. Each library lives behind its own subpath
 * (`@ui-organized/react/icons/lucide`), and importing that subpath registers it
 * here. Whatever you don't import is never resolved, which is what makes the
 * optional peer honest. It also keeps `Icon` synchronous — a dynamic `import()`
 * would have made the most common element in the system render a frame late.
 *
 * ── Why it is generic, and why each framework gets its own ──────────────────
 *
 * An icon is a *component*, and a Svelte component is not a React one. The
 * shape of the registry is identical across frameworks; the thing it stores is
 * not. So the type is a parameter, and each framework package calls
 * `createIconRegistry` with its own key — sharing one would let React's `Icon`
 * read a Svelte component out of the map and render nothing.
 */

import type { CanonicalIconName } from "@ui-organized/utils";

export type IconLibrary = "lucide" | "tabler" | "heroicons";

/** Canonical name → component, for one library in one style. */
export type IconNameMap<TComponent> = Partial<Record<CanonicalIconName, TComponent>>;

/**
 * One library's adapter.
 *
 * `svgProps` belongs here rather than in `Icon` because the libraries disagree
 * about how they're sized and stroked — Lucide takes `size`/`strokeWidth`,
 * Tabler takes `size`/`stroke`, Heroicons take `width`/`height`/`strokeWidth`.
 * Keeping that per-adapter means a new library is a new subpath and nothing else.
 */
export interface IconSet<TComponent> {
  library: IconLibrary;
  /** Outline/stroke variants. Every library has these. */
  outline: IconNameMap<TComponent>;
  /** Solid/filled variants, where the library ships them. */
  solid?: IconNameMap<TComponent>;
  /** Map the resolved size and stroke onto this library's own SVG props. */
  svgProps(size: number, stroke: number | undefined): Record<string, unknown>;
}

export interface IconRegistry<TComponent> {
  /**
   * Register an icon set. Called for its side effect by each `icons/*` subpath,
   * so `import "@ui-organized/<framework>/icons/lucide"` is all a consumer needs.
   */
  registerIconSet(set: IconSet<TComponent>): void;
  getIconSet(library: IconLibrary): IconSet<TComponent> | undefined;
  /** Which libraries have been registered — used by the dev warning. */
  registeredLibraries(): IconLibrary[];
}

/**
 * Build a registry stored on `globalThis` under `key`.
 *
 * Keyed globally rather than held in a module-local `Map` because this module is
 * reachable from several bundle entries (the main one plus each `icons/*`
 * subpath). ESM code-splitting normally gives them a shared chunk, but a CJS
 * build cannot split — each entry inlines its own copy. Two copies means two
 * Maps: `icons/lucide` would register into one and `Icon` would read the other,
 * and icons would silently never render. A global key is the one storage that is
 * immune to how the bundler chose to lay the modules out.
 */
export function createIconRegistry<TComponent>(key: symbol): IconRegistry<TComponent> {
  type GlobalWithRegistry = typeof globalThis & {
    [k: symbol]: Map<IconLibrary, IconSet<TComponent>> | undefined;
  };
  const globalRef = globalThis as GlobalWithRegistry;
  const registry: Map<IconLibrary, IconSet<TComponent>> = (globalRef[key] ??= new Map());

  return {
    registerIconSet(set) {
      registry.set(set.library, set);
    },
    getIconSet(library) {
      return registry.get(library);
    },
    registeredLibraries() {
      return [...registry.keys()];
    },
  };
}
