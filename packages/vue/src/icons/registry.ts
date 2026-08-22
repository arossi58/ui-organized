/**
 * This package's icon-set registry: the shared mechanism from
 * `@ui-organized/core`, bound to Vue component types.
 *
 * The registry itself — why it exists, why it is keyed on `globalThis`, and why
 * each framework gets its own — is documented in core. All that happens here is
 * fixing the component type, and choosing a key distinct from the React and
 * Svelte packages' so none of them can read another's components.
 */

import type { Component } from "vue";
import {
  createIconRegistry,
  type IconNameMap as CoreIconNameMap,
  type IconSet as CoreIconSet,
} from "@ui-organized/core";

export type { IconLibrary } from "@ui-organized/core";

/** An icon component supplied directly — e.g. from lucide-vue-next. */
export type IconComponent = Component;

/** Canonical name → Vue component, for one library in one style. */
export type IconNameMap = CoreIconNameMap<IconComponent>;

/** One library's adapter. See `IconSet` in @ui-organized/core. */
export type IconSet = CoreIconSet<IconComponent>;

const { registerIconSet, getIconSet, registeredLibraries } =
  createIconRegistry<IconComponent>(Symbol.for("@ui-organized/vue.iconRegistry"));

export { registerIconSet, getIconSet, registeredLibraries };
