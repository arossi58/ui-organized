import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "../Icon/Icon.types.js";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status color variant. */
  variant?: "success" | "info" | "info-secondary" | "caution" | "warning" | "error";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * When true (default), renders a solid filled tag with high-contrast text.
   * When false, renders a subdued tinted-background tag with colored text.
   */
  emphasized?: boolean;
  /**
   * Optional icon rendered inside the tag — a canonical icon name or an icon
   * component. Rendered at 16px across every tag size, `spacing-01` from the
   * label.
   */
  icon?: CanonicalIconName | IconComponent;
  /** Which side of the label the icon sits on. Defaults to 'left'. */
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}
