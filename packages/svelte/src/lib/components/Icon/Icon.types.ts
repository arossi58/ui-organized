import type { IconComponent } from "../../icons/registry.js";

export type { IconComponent };

/**
 * An icon's name as its library publishes it: `"x"` or `"chevron-down"` in
 * Lucide and Tabler. Nothing is renamed, so a name belongs to one library.
 * Register the icon first with `registerIcons` from that library's subpath.
 */
export type IconName = string;

export interface IconProps {
  /**
   * Either the icon's native name in the active library (`"x"`), registered
   * with `registerIcons`, or a library icon component supplied directly.
   */
  name: IconName | IconComponent;
  /**
   * Icon size in pixels. Applied to both width and height.
   * @default 24
   */
  size?: number;
  /**
   * Accessible label for meaningful (non-decorative) icons.
   * When omitted the icon is treated as decorative and hidden from assistive tech.
   */
  label?: string;
  /** Additional CSS class applied to the outer wrapper span. */
  class?: string;
}
