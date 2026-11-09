import type { ComponentType } from "react";

/**
 * An icon component supplied directly — e.g. `import { Image } from
 * "lucide-react"`. Passing a component needs no registration.
 */
export type IconComponent = ComponentType<Record<string, unknown>>;

/**
 * An icon's name as its library publishes it: `"x"` or `"chevron-down"` in
 * Lucide and Tabler, `"x-mark"` in Heroicons. Nothing is renamed, so a name
 * belongs to one library. Register the icon first with `registerIcons` from
 * that library's subpath.
 */
export type IconName = string;

export interface IconProps {
  /**
   * Either the icon's native name in the active library (`"x"`, `"x-mark"`),
   * registered with `registerIcons`, or a library icon component supplied
   * directly (e.g. `X` from lucide-react).
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
  className?: string;
}
