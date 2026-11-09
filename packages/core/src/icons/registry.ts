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

import { toNativeName } from "./nativeName.js";
import type { SystemGlyph } from "./systemGlyphs.js";

export type IconLibrary = "lucide" | "tabler" | "heroicons";

/**
 * Native icon name → component, e.g. `{ "chevron-down": ChevronDown }`. The
 * names are the library's own; see `./nativeName.ts`.
 */
export type IconNameMap<TComponent> = Record<string, TComponent>;

/** Internal glyph → component, for one library in one style. See `./systemGlyphs.ts`. */
export type SystemGlyphMap<TComponent> = Partial<Record<SystemGlyph, TComponent>>;

/**
 * One library's adapter.
 *
 * It carries only the glyphs the components draw themselves. The icons an app
 * names in `<Icon name="…">` are its own choice, so it registers them with
 * `registerIcons` and only those reach the bundle.
 *
 * `svgProps` belongs here rather than in `Icon` because the libraries disagree
 * about how they're sized and stroked — Lucide takes `size`/`strokeWidth`,
 * Tabler takes `size`/`stroke`, Heroicons take `width`/`height`/`strokeWidth`.
 * Keeping that per-adapter means a new library is a new subpath and nothing else.
 */
export interface IconSet<TComponent> {
  library: IconLibrary;
  /** Outline/stroke cuts of the internal glyphs. Every library has these. */
  outline: SystemGlyphMap<TComponent>;
  /** Solid/filled cuts, where the library ships them. */
  solid?: SystemGlyphMap<TComponent>;
  /** Map the resolved size and stroke onto this library's own SVG props. */
  svgProps(size: number, stroke: number | undefined): Record<string, unknown>;
}

export interface RegisterIconsOptions {
  /**
   * Which cut these components are. Register the solid cuts separately —
   * `registerIcons({ StarIcon }, { style: "solid" })` from
   * `@heroicons/react/24/solid` — and `style="solid"` on the provider picks
   * them, falling back to the outline cut where none was registered.
   * @default "outline"
   */
  style?: "outline" | "solid";
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
  /**
   * Make icons available by their native names. Keys are either the export
   * names as imported (`{ ChevronDown, X }`, converted by `toNativeName`) or
   * native names already (`{ "arrow-down-0-1": ArrowDown01 }`, kept as given).
   * Adds to what is registered; never replaces it.
   */
  registerIcons(
    library: IconLibrary,
    icons: Record<string, TComponent>,
    options?: RegisterIconsOptions,
  ): void;
  /** A registered icon by native name. Solid falls back to outline. */
  getIcon(library: IconLibrary, name: string, style: "outline" | "solid"): TComponent | undefined;
  /** Every native name registered for `library`, sorted — used by the dev warning. */
  registeredNames(library: IconLibrary): string[];
}

interface RegistryState<TComponent> {
  sets: Map<IconLibrary, IconSet<TComponent>>;
  icons: Map<IconLibrary, { outline: Map<string, TComponent>; solid: Map<string, TComponent> }>;
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
    [k: symbol]: RegistryState<TComponent> | Map<IconLibrary, IconSet<TComponent>> | undefined;
  };
  const globalRef = globalThis as GlobalWithRegistry;
  const existing = globalRef[key];
  // An older copy of this package stored the bare Map of sets under the same
  // key. Adopt it rather than replacing it, so a mixed install still shares.
  const state: RegistryState<TComponent> =
    existing instanceof Map
      ? { sets: existing, icons: new Map() }
      : (existing ?? { sets: new Map(), icons: new Map() });
  globalRef[key] = state;
  const { sets, icons } = state;

  const iconsFor = (library: IconLibrary) => {
    let entry = icons.get(library);
    if (!entry) icons.set(library, (entry = { outline: new Map(), solid: new Map() }));
    return entry;
  };

  return {
    registerIconSet(set) {
      sets.set(set.library, set);
    },
    getIconSet(library) {
      return sets.get(library);
    },
    registeredLibraries() {
      return [...sets.keys()];
    },
    registerIcons(library, components, options = {}) {
      const style = options.style ?? "outline";
      const target = iconsFor(library)[style];
      for (const [exportName, component] of Object.entries(components)) {
        let name = toNativeName(library, exportName);
        // Tabler names its filled cuts `star-filled`. Registered as the solid
        // style, that is the solid cut of `star`, so it answers to `star`.
        if (style === "solid") name = name.replace(/-filled$/, "");
        target.set(name, component);
      }
    },
    getIcon(library, name, style) {
      const entry = icons.get(library);
      if (!entry) return undefined;
      return (style === "solid" ? entry.solid.get(name) : undefined) ?? entry.outline.get(name);
    },
    registeredNames(library) {
      const entry = icons.get(library);
      if (!entry) return [];
      return [...new Set([...entry.outline.keys(), ...entry.solid.keys()])].sort();
    },
  };
}
