import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "../Icon/Icon.types.js";

export interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  /** Visual style intent. Defaults to 'primary'. */
  intent?: "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "destructive-ghost";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * Optional icon to render inside the button. Either a canonical icon name, or
   * a library icon component supplied directly (e.g. `PanelLeft` from
   * lucide-react) for the cases the canonical set — a small UI vocabulary of
   * chevrons, checks and alerts — doesn't have a word for.
   *
   * Passed straight to `Icon`, which has accepted both since it was written;
   * this only stops the button's own prop being the narrower of the two.
   */
  icon?: CanonicalIconName | IconComponent;
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
