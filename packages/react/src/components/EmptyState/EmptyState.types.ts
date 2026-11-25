import type * as React from "react";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** What is missing, in a few words: "No results", "Nothing here yet". */
  title: React.ReactNode;
  /** One sentence on why, or what would fill it. */
  description?: React.ReactNode;
  /**
   * An icon for the topic, drawn as a neutral subtle FeaturedIcon sized to the
   * empty state. Its native name in the active library, or a component.
   */
  icon?: IconName | IconComponent;
  /** Anything else in the media slot, such as an illustration. Overrides `icon`. */
  media?: React.ReactNode;
  /** The way out: one primary action, and at most one secondary. */
  actions?: React.ReactNode;
  /** `sm` for a table cell or a card, `md` for a panel, `lg` for a page. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /**
   * Render the title as a heading at this level. Without it the title is a
   * paragraph, so the default never breaks the page's heading outline. Use 1
   * only for a page that is nothing but the empty state, such as a 404.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}
