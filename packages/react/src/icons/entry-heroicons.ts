/**
 * `@ui-organized/react/icons/heroicons` — the Heroicons adapter.
 *
 * Importing this module registers Heroicons, so
 * `<IconProvider library=\"heroicons\">` draws the components' own glyphs from it;
 * `registerIcons` below adds the icons you name. This is the
 * only module that imports `@heroicons/react`.
 *
 * ```ts
 * import "@ui-organized/react/icons/heroicons";
 * ```
 */

import { heroiconsOutlineSet, heroiconsSolidSet } from "./heroicons.js";
import type { ComponentType } from "react";
import {
  registerIconSet,
  type IconSet,
  registerIcons as registerNamedIcons,
  type RegisterIconsOptions,
} from "./registry.js";

export const heroiconsIcons: IconSet = {
  library: "heroicons",
  outline: heroiconsOutlineSet,
  solid: heroiconsSolidSet,
  // Heroicons take no `size` prop — they size from width/height.
  svgProps: (size, stroke) => ({
    width: size,
    height: size,
    ...(stroke !== undefined ? { strokeWidth: stroke } : {}),
  }),
};

registerIconSet(heroiconsIcons);

export { heroiconsOutlineSet, heroiconsSolidSet };

/**
 * Make Heroicons icons available to `<Icon name>` under their own names.
 *
 * Pass them as imported and the names follow from the exports
 * (`CameraIcon` → `"camera"`), or key them by native name yourself where
 * the export can't be read back unambiguously (`{ h1: H1Icon }`).
 * Only what you register reaches your bundle.
 *
 * ```ts
 * import { CameraIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";
 * registerIcons({ CameraIcon, RocketLaunchIcon });
 * ```
 */
export function registerIcons(
  icons: Record<string, ComponentType<any>>,
  options?: RegisterIconsOptions,
): void {
  registerNamedIcons("heroicons", icons, options);
}
