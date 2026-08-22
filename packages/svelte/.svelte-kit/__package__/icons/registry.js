/**
 * This package's icon-set registry: the shared mechanism from
 * `@ui-organized/core`, bound to Svelte component types.
 *
 * The registry itself — why it exists, why it is keyed on `globalThis`, and why
 * each framework gets its own — is documented in core. All that happens here is
 * fixing the component type, and choosing a key distinct from the React
 * package's so the two never read each other's components.
 */
import { createIconRegistry, } from "@ui-organized/core";
const { registerIconSet, getIconSet, registeredLibraries } = createIconRegistry(Symbol.for("@ui-organized/svelte.iconRegistry"));
export { registerIconSet, getIconSet, registeredLibraries };
