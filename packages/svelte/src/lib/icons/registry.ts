/**
 * This package's icon-set registry: the shared mechanism from
 * `@ui-organized/core`, bound to Svelte component types.
 *
 * The registry itself — why it exists, why it is keyed on `globalThis`, and why
 * each framework gets its own — is documented in core. All that happens here is
 * fixing the component type, and choosing a key distinct from the React
 * package's so the two never read each other's components.
 */

import type { Component } from "svelte";
import {
  createIconRegistry,
  type IconNameMap as CoreIconNameMap,
  type IconSet as CoreIconSet,
  type SystemGlyphMap as CoreSystemGlyphMap,
} from "@ui-organized/core";

export type { IconLibrary, RegisterIconsOptions } from "@ui-organized/core";

/** An icon component supplied directly — e.g. `import Image from "@lucide/svelte/icons/image"`. */
export type IconComponent = Component<Record<string, unknown>>;

/** Native name → Svelte component, e.g. `{ \"chevron-down\": ChevronDown }`. */
export type IconNameMap = CoreIconNameMap<IconComponent>;

/** One library's adapter. See `IconSet` in @ui-organized/core. */
export type IconSet = CoreIconSet<IconComponent>;

/** The components' own glyphs, for one library in one style. */
export type SystemGlyphMap = CoreSystemGlyphMap<IconComponent>;

const { registerIconSet, getIconSet, registeredLibraries, registerIcons, getIcon, registeredNames } =
  createIconRegistry<IconComponent>(Symbol.for("@ui-organized/svelte.iconRegistry"));

export {
  registerIconSet,
  getIconSet,
  registeredLibraries,
  registerIcons,
  getIcon,
  registeredNames,
};
