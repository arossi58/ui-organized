/**
 * The `@ui-organized/angular/icons/lucide` entry point.
 *
 * Importing it registers the set; that side effect is the whole purpose, and the
 * reason the package's `sideEffects` field has to keep this file. React shipped
 * a version where it did not, and icons rendered in dev and vanished in
 * `vite build`.
 *
 *     import "@ui-organized/angular/icons/lucide";
 *
 * This file and everything it reaches must stay inside `src/lib/icons/`:
 * ng-packagr sets a secondary entry point's `rootDir` to the directory of its
 * entry file, and anything above that is a TS6059.
 */
import { lucideIconSet } from "./lucide.js";
import { ngIconsSvgProps, registerIconSet, type IconSet } from "./registry.js";

export const lucideIcons: IconSet = {
  library: "lucide",
  outline: lucideIconSet,
  // Lucide ships an outline cut only; `style: "solid"` falls back to it.
  svgProps: ngIconsSvgProps,
};

registerIconSet(lucideIcons);
