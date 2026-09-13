/**
 * `@ui-organized/vue/icons/heroicons` — the Heroicons adapter.
 *
 * Importing this module registers Heroicons, so
 * `<IconProvider library="heroicons">` resolves canonical names. This is the
 * only module that imports `@heroicons/vue`.
 *
 * ```ts
 * import "@ui-organized/vue/icons/heroicons";
 * ```
 */

import { heroiconsOutlineSet, heroiconsSolidSet } from "./heroicons.js";
import { registerIconSet, type IconSet } from "./registry.js";

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
