/**
 * `@ui-organized/svelte/icons/tabler` — the Tabler adapter.
 *
 * Importing this module registers Tabler, so `<IconProvider library=\"tabler\">`
 * draws the components' own glyphs from it; `registerIcons` below adds the
 * icons you name. This is the only module that imports
 * `@tabler/icons-svelte`.
 *
 * ```ts
 * import "@ui-organized/svelte/icons/tabler";
 * ```
 */

import { tablerIconSet, tablerSolidSet } from "./tabler.js";
import {
  registerIconSet,
  type IconSet,
  registerIcons as registerNamedIcons,
  type RegisterIconsOptions,
  type IconComponent,
} from "./registry.js";

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

/**
 * Make Tabler icons available to `<Icon name>` under their own Tabler names.
 *
 * Pass them as imported and the names follow from the exports
 * (`IconCamera` → `"camera"`), or key them by native name yourself where
 * the export can't be read back unambiguously (`{ "crop-16-9": IconCrop169 }`).
 * Only what you register reaches your bundle.
 *
 * ```ts
 * import { IconCamera, IconRocket } from "@tabler/icons-svelte";
 * registerIcons({ IconCamera, IconRocket });
 * ```
 */
export function registerIcons(
  icons: Record<string, IconComponent>,
  options?: RegisterIconsOptions,
): void {
  registerNamedIcons("tabler", icons, options);
}
