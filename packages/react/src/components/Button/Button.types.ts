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
  /**
   * Render the button as a supplied element (e.g. an `<a>` or router `Link`)
   * instead of a native `<button>`. The element is cloned with the button's
   * classes and props merged in, so CTAs can be real, crawlable links while
   * staying the library `Button`. Restores the polymorphism Base UI's `render`
   * prop provided before the Ark UI migration (Ark has no Button primitive).
   */
  render?: React.ReactElement;
}
