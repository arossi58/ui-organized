import type { CanonicalIconName } from "@ui-organized/utils";

export interface IconProps {
  /** Canonical icon name from the design system's defined set. */
  name: CanonicalIconName;
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
