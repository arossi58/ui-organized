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
import { type IconNameMap as CoreIconNameMap, type IconSet as CoreIconSet } from "@ui-organized/core";
export type { IconLibrary } from "@ui-organized/core";
/** An icon component supplied directly — e.g. `import Image from "@lucide/svelte/icons/image"`. */
export type IconComponent = Component<Record<string, unknown>>;
/** Canonical name → Svelte component, for one library in one style. */
export type IconNameMap = CoreIconNameMap<IconComponent>;
/** One library's adapter. See `IconSet` in @ui-organized/core. */
export type IconSet = CoreIconSet<IconComponent>;
declare const registerIconSet: (set: CoreIconSet<IconComponent>) => void, getIconSet: (library: import("@ui-organized/core").IconLibrary) => CoreIconSet<IconComponent> | undefined, registeredLibraries: () => import("@ui-organized/core").IconLibrary[];
export { registerIconSet, getIconSet, registeredLibraries };
//# sourceMappingURL=registry.d.ts.map