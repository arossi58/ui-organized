/**
 * `@ui-organized/vue/icons/tabler` — the Tabler adapter.
 *
 * Importing this module registers Tabler, so `<IconProvider library="tabler">`
 * resolves canonical names. This is the only module that imports
 * `@tabler/icons-vue`.
 *
 * ```ts
 * import "@ui-organized/vue/icons/tabler";
 * ```
 */

import { tablerIconSet, tablerSolidSet } from "./tabler.js";
import { registerIconSet, type IconSet } from "./registry.js";

export const tablerIcons: IconSet = {
  library: "tabler",
  outline: tablerIconSet,
  solid: tablerSolidSet,
  // Tabler names its stroke prop `stroke`, not `strokeWidth`.
  svgProps: (size, stroke) => ({
    size,
    ...(stroke !== undefined ? { stroke } : {}),
  }),
};

registerIconSet(tablerIcons);

export { tablerIconSet, tablerSolidSet };
