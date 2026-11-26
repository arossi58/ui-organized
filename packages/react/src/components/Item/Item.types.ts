import type * as React from "react";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface ItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** What the row is, in a few words. */
  title: React.ReactNode;
  /** One line under the title. */
  description?: React.ReactNode;
  /** An icon, drawn in a tile. Its native name in the active library, or a component. */
  icon?: IconName | IconComponent;
  /** Anything else at the start, such as an Avatar or an image. Overrides `icon`. */
  media?: React.ReactNode;
  /** Controls at the end, such as a Switch or a Button. They stay clickable on a link row. */
  actions?: React.ReactNode;
  /** Makes the whole row a link to this address. The link is the title; the row is its hit area. */
  href?: string;
  /** Passed to the link when `href` is set. */
  target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  /** Passed to the link when `href` is set. */
  rel?: string;
  /**
   * A router link to use instead of a plain `<a href>`, such as `<Link to="/settings" />`.
   * It is cloned with the `item__link` class and the title as its children.
   */
  linkRender?: React.ReactElement;
  /** `plain` with no frame, `outline` with a border, `muted` on a filled surface. Defaults to 'plain'. */
  variant?: "plain" | "outline" | "muted";
  /** Defaults to 'md'. */
  size?: "sm" | "md";
  /** Render the title as a heading at this level. Without it the title is a paragraph. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** An id for the title, so a control in `actions` can be named by it with `aria-labelledby`. */
  titleId?: string;
  /** An id for the description, for `aria-describedby`. */
  descriptionId?: string;
}

export interface ItemGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `plain`, or `outline` to put the whole group in one frame. Defaults to 'plain'. */
  variant?: "plain" | "outline";
  /** A rule between rows. Defaults to true. */
  divided?: boolean;
  children?: React.ReactNode;
}
