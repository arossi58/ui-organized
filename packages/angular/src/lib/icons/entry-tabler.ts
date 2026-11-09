/**
 * The `@ui-organized/angular/icons/tabler` entry point.
 *
 * Importing it registers the set; that side effect is the whole purpose, and the
 * reason the package's `sideEffects` field has to keep this file. React shipped
 * a version where it did not, and icons rendered in dev and vanished in
 * `vite build`.
 *
 *     import "@ui-organized/angular/icons/tabler";
 *
 * This file and everything it reaches must stay inside `src/lib/icons/`:
 * ng-packagr sets a secondary entry point's `rootDir` to the directory of its
 * entry file, and anything above that is a TS6059.
 */
import { tablerIconSet, tablerSolidSet } from "./tabler.js";
import {
  ngIconsSvgProps,
  registerIconSet,
  type IconSet,
  registerIcons as registerNamedIcons,
  type RegisterIconsOptions,
  type IconMarkup,
} from "./registry.js";

export const tablerIcons: IconSet = {
  library: "tabler",
  outline: tablerIconSet,
  solid: tablerSolidSet,
  svgProps: ngIconsSvgProps,
};

registerIconSet(tablerIcons);

/**
 * Make Tabler icons available to `<Icon name>` under their own Tabler names.
 *
 * Pass them as imported and the names follow from the exports
 * (`tablerCamera` → `"camera"`), or key them by native name yourself where
 * the export can't be read back unambiguously (`{ "crop-16-9": tablerCrop169 }`).
 * Only what you register reaches your bundle.
 *
 * ```ts
 * import { tablerCamera, tablerRocket } from "@ng-icons/tabler-icons";
 * registerIcons({ tablerCamera, tablerRocket });
 * ```
 */
export function registerIcons(
  icons: Record<string, IconMarkup>,
  options?: RegisterIconsOptions,
): void {
  registerNamedIcons("tabler", icons, options);
}
