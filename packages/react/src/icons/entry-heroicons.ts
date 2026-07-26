/**
 * `@ui-organized/react/icons/heroicons` — the Heroicons adapter.
 *
 * Importing this module registers Heroicons, so
 * `<IconProvider library="heroicons">` resolves canonical names. This is the
 * only module that imports `@heroicons/react`.
 *
 * ```ts
 * import "@ui-organized/react/icons/heroicons";
 * ```
 */

import { heroiconsOutlineSet, heroiconsSolidSet } from "./heroicons.js";
import { registerIconSet, type IconSet } from "./registry.js";

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
