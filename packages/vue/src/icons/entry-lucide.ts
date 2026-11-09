/**
 * `@ui-organized/vue/icons/lucide` — the Lucide adapter.
 *
 * Importing this module registers Lucide, so `<IconProvider library=\"lucide\">`
 * draws the components' own glyphs from it; `registerIcons` below adds the
 * icons you name. This is the *only* module in the package that
 * imports `@lucide/vue`; nothing here is reachable from the main entry, which is
 * what keeps the other icon libraries out of your bundle.
 *
 * ```ts
 * import "@ui-organized/vue/icons/lucide";   // register, then use library="lucide"
 * ```
 *
 * Or pass it explicitly, if you'd rather not rely on import side effects:
 *
 * ```vue
 * <script setup>
 * import { lucideIcons } from "@ui-organized/vue/icons/lucide";
 * </script>
 * <template><IconProvider library="lucide" :icons="lucideIcons"> … </IconProvider></template>
 * ```
 */

import { lucideIconSet } from "./lucide.js";
import {
  registerIconSet,
  type IconSet,
  registerIcons as registerNamedIcons,
  type RegisterIconsOptions,
  type IconComponent,
} from "./registry.js";

export const lucideIcons: IconSet = {
  library: "lucide",
  outline: lucideIconSet,
  // Lucide ships outline only; `style="solid"` falls back to the outline cut.
  svgProps: (size, stroke) => ({
    size,
    ...(stroke !== undefined ? { strokeWidth: stroke } : {}),
  }),
};

registerIconSet(lucideIcons);

export { lucideIconSet };

/**
 * Make Lucide icons available to `<Icon name>` under their own Lucide names.
 *
 * Pass them as imported and the names follow from the exports
 * (`Camera` → `"camera"`), or key them by native name yourself where
 * the export can't be read back unambiguously (`{ "arrow-down-0-1": ArrowDown01 }`).
 * Only what you register reaches your bundle.
 *
 * ```ts
 * import { Camera, Rocket } from "@lucide/vue";
 * registerIcons({ Camera, Rocket });
 * ```
 */
export function registerIcons(
  icons: Record<string, IconComponent>,
  options?: RegisterIconsOptions,
): void {
  registerNamedIcons("lucide", icons, options);
}
