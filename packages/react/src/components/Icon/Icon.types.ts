import type { ComponentType } from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

/**
 * An icon component supplied directly — e.g. `import { Image } from
 * "lucide-react"`. Passing a component keeps tree-shaking (only the icons you
 * import ship) and needs no canonical-name registration.
 */
export type IconComponent = ComponentType<Record<string, unknown>>;

export interface IconProps {
  /**
   * Either a canonical icon name from the design system's set, or a library
   * icon component supplied directly (e.g. from lucide-react).
   */
  name: CanonicalIconName | IconComponent;
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
