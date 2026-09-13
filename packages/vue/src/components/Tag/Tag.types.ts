import type { CanonicalIconName } from "@ui-organized/utils";
import type { ControlSize } from "@ui-organized/core";
import type { IconComponent } from "../../icons/registry.js";

export interface TagProps {
  /** Status color variant. */
  variant?: "success" | "info" | "info-secondary" | "caution" | "warning" | "error";
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * When true (default), renders a solid filled tag with high-contrast text.
   * When false, renders a subdued tinted-background tag with colored text.
   */
  emphasized?: boolean;
  /** Optional icon — rendered at 16px across every tag size. */
  icon?: CanonicalIconName | IconComponent;
  /** Which side of the label the icon sits on. Defaults to 'left'. */
  iconPosition?: "left" | "right";
}
