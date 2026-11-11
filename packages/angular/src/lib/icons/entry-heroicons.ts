/**
 * The `@ui-organized/angular/icons/heroicons` entry point.
 *
 * Importing it registers the set; that side effect is the whole purpose, and the
 * reason the package's `sideEffects` field has to keep this file. React shipped
 * a version where it did not, and icons rendered in dev and vanished in
 * `vite build`.
 *
 *     import "@ui-organized/angular/icons/heroicons";
 *
 * This file and everything it reaches must stay inside `src/lib/icons/`:
 * ng-packagr sets a secondary entry point's `rootDir` to the directory of its
 * entry file, and anything above that is a TS6059.
 */
import { heroiconsOutlineSet, heroiconsSolidSet } from "./heroicons.js";
import {
  ngIconsSvgProps,
  registerIconSet,
  type IconSet,
  registerIcons as registerNamedIcons,
  type RegisterIconsOptions,
  type IconMarkup,
} from "./registry.js";

export const heroiconsIcons: IconSet = {
  library: "heroicons",
  outline: heroiconsOutlineSet,
  solid: heroiconsSolidSet,
  svgProps: ngIconsSvgProps,
};

registerIconSet(heroiconsIcons);

/**
 * Make Heroicons icons available to `<Icon name>` under their own names.
 *
 * Pass them as imported and the names follow from the exports
 * (`heroCamera` → `"camera"`), or key them by native name yourself where
 * the export can't be read back unambiguously (`{ h1: heroH1 }`).
 * Only what you register reaches your bundle.
 *
 * ```ts
 * import { heroCamera, heroRocketLaunch } from "@ng-icons/heroicons/outline";
 * registerIcons({ heroCamera, heroRocketLaunch });
 * ```
 */
export function registerIcons(
  icons: Record<string, IconMarkup>,
  options?: RegisterIconsOptions,
): void {
  registerNamedIcons("heroicons", icons, options);
}
