import type * as React from "react";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Status color variant. */
  variant?: "success" | "info" | "info-secondary" | "caution" | "error";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * When true (default), renders a solid filled tag with high-contrast text.
   * When false, renders a subdued tinted-background tag with colored text.
   */
  emphasized?: boolean;
  /**
   * Optional icon rendered inside the tag — the icon's native name in the active
   * library or an icon component. Rendered at 16px across every tag size, `spacing-01` from the
   * label.
   */
  icon?: IconName | IconComponent;
  /** Which side of the label the icon sits on. Defaults to 'left'. */
  iconPosition?: "left" | "right";
  children?: React.ReactNode;
}
