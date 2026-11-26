import type * as React from "react";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface ButtonProps extends React.ComponentPropsWithRef<"button"> {
  /**
   * Visual style intent. Defaults to 'primary'. `link` and `link-neutral` draw
   * text with no box (brand-coloured and secondary-text respectively), for an
   * action that sits in a sentence, a card footer or a row of metadata.
   */
  intent?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "ghost"
    | "destructive"
    | "destructive-ghost"
    | "link"
    | "link-neutral";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * Optional icon to render inside the button. Either the icon's native name in
   * the active library (`"panel-left"`, registered with `registerIcons`), or a
   * library icon component supplied directly (e.g. `PanelLeft` from
   * lucide-react). Passed straight to `Icon`.
   */
  icon?: IconName | IconComponent;
  /**
   * Whether the icon appears before or after the button label.
   * @default 'left'
   */
  iconPosition?: "left" | "right";
  /**
   * Show a spinner and stop responding while an action runs. The spinner takes
   * the icon's place (or the leading edge when there is no icon), the button
   * keeps its focus and its label, and it is marked `aria-busy` and
   * `aria-disabled` rather than `disabled`, so focus is not lost mid-request.
   */
  loading?: boolean;
  /**
   * Render a real `<a href>` with the button's appearance, for an action that
   * navigates. Disabled or loading, the anchor drops its `href` and is marked
   * `aria-disabled`. For a router link, use `render` instead.
   */
  href?: string;
  /** Passed to the anchor when `href` is set. */
  target?: React.HTMLAttributeAnchorTarget;
  /** Passed to the anchor when `href` is set. */
  rel?: string;
  /** Passed to the anchor when `href` is set. */
  download?: boolean | string;
  /**
   * Render the button as a supplied element (e.g. an `<a>` or router `Link`)
   * instead of a native `<button>`. The element is cloned with the button's
   * classes and props merged in, so CTAs can be real, crawlable links while
   * staying the library `Button`. Restores the polymorphism Base UI's `render`
   * prop provided before the Ark UI migration (Ark has no Button primitive).
   */
  render?: React.ReactElement;
}
