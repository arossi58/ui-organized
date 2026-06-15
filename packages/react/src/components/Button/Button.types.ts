import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  /** Visual style intent. Defaults to 'primary'. */
  intent?: "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "destructive-ghost";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * Optional icon to render inside the button.
   * Uses the Icon component — references the active icon library via context.
   */
  icon?: CanonicalIconName;
  /**
   * Whether the icon appears before or after the button label.
   * @default 'left'
   */
  iconPosition?: "left" | "right";
}
