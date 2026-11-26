import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface ItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> {
  /** What the row is, in a few words. */
  title: string;
  /** One line under the title. */
  description?: string;
  /** An icon, drawn in a tile. */
  icon?: IconName | IconComponent;
  /** Anything else at the start, such as an Avatar or an image. Overrides `icon`. */
  media?: Snippet;
  /** Controls at the end, such as a Switch or a Button. They stay clickable on a link row. */
  actions?: Snippet;
  /** Makes the whole row a link to this address. The link is the title; the row is its hit area. */
  href?: string;
  /** Passed to the link when `href` is set. */
  target?: string;
  /** Passed to the link when `href` is set. */
  rel?: string;
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
  class?: string;
}

export interface ItemGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** `plain`, or `outline` to put the whole group in one frame. Defaults to 'plain'. */
  variant?: "plain" | "outline";
  /** A rule between rows. Defaults to true. */
  divided?: boolean;
  children?: Snippet;
  class?: string;
}
