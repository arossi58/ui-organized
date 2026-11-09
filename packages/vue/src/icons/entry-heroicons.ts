/**
 * `@ui-organized/vue/icons/heroicons` — the Heroicons adapter.
 *
 * Importing this module registers Heroicons, so
 * `<IconProvider library=\"heroicons\">` draws the components' own glyphs from it;
 * `registerIcons` below adds the icons you name. This is the
 * only module that imports `@heroicons/vue`.
 *
 * ```ts
 * import "@ui-organized/vue/icons/heroicons";
 * ```
 */

import { heroiconsOutlineSet, heroiconsSolidSet } from "./heroicons.js";
import {
  registerIconSet,
  type IconSet,
  registerIcons as registerNamedIcons,
  type RegisterIconsOptions,
  type IconComponent,
} from "./registry.js";

export const heroiconsIcons: IconSet = {
  library: "heroicons",
  outline: heroiconsOutlineSet,
  solid: heroiconsSolidSet,
  /**
   * Sized through `style`, not through attributes — the one adapter that has to.
   *
   * `@heroicons/vue` icons are bare render functions that ignore their props and
   * declare none, and Vue passes only `class`, `style` and `on*` listeners
   * through to the root of a functional component like that. `width={size}`
   * simply disappears: the icon renders at the library's own 24px and 1.5
   * stroke, silently. (React's Heroicons spread their props onto the `<svg>`,
   * which is why the React adapter can pass `width`/`height`/`strokeWidth`.)
   *
   * CSS reaches the same three properties and outranks the presentation
   * attributes the component hard-codes, so the result is identical. Sizes carry
   * a unit because CSS lengths need one; `strokeWidth` does not, because
   * `stroke-width` is unitless in the SVG's own user space — which is what
   * `resolveIconStroke` already returns.
   */
  svgProps: (size, stroke) => ({
    style: {
      width: `${size}px`,
      height: `${size}px`,
      ...(stroke !== undefined ? { strokeWidth: stroke } : {}),
    },
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
 * import { CameraIcon, RocketLaunchIcon } from "@heroicons/vue/24/outline";
 * registerIcons({ CameraIcon, RocketLaunchIcon });
 * ```
 */
export function registerIcons(
  icons: Record<string, IconComponent>,
  options?: RegisterIconsOptions,
): void {
  registerNamedIcons("heroicons", icons, options);
}
