import type { IconConfig, IconStyle } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";

export interface IconProviderProps extends Partial<Omit<IconConfig<IconComponent>, "style">> {
  /**
   * Icon style — outline/stroke or solid/filled.
   *
   * Spelled `style` in the React and Svelte libraries, and `iconStyle` here
   * because Vue reserves `style`. See the note in `IconProvider.vue`.
   */
  iconStyle?: IconStyle;
  /**
   * Never read. Declared only so the wrong spelling can be intercepted and
   * explained rather than silently rendering the wrong icons.
   */
  style?: unknown;
}
