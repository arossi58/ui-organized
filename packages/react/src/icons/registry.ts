/**
 * This package's icon-set registry: the shared mechanism from
 * `@ui-organized/core`, bound to React component types.
 *
 * The registry itself — why it exists, why it is keyed on `globalThis`, and why
 * each framework gets its own — is documented in core. All that happens here is
 * fixing the component type, because a React icon is a `ComponentType` and a
 * Svelte one is not.
 *
 * The key is unchanged from when this file owned the Map outright, so a mixed
 * install where two copies of this package are present still shares one
 * registry.
 */

import type { ComponentType } from "react";
import {
  createIconRegistry,
  type IconNameMap as CoreIconNameMap,
  type IconSet as CoreIconSet,
} from "@ui-organized/core";

export type { IconLibrary } from "@ui-organized/core";

/** Canonical name → React component, for one library in one style. */
export type IconNameMap = CoreIconNameMap<ComponentType<any>>;

/** One library's adapter. See `IconSet` in @ui-organized/core. */
export type IconSet = CoreIconSet<ComponentType<any>>;

const { registerIconSet, getIconSet, registeredLibraries } = createIconRegistry<
  ComponentType<any>
>(Symbol.for("@ui-organized/react.iconRegistry"));

export { registerIconSet, getIconSet, registeredLibraries };
