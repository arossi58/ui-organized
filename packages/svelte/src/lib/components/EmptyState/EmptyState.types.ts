import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "title"> {
  /** What is missing, in a few words: "No results", "Nothing here yet". */
  title: string;
  /** One sentence on why, or what would fill it. */
  description?: string;
  /** An icon for the topic, drawn as a neutral subtle FeaturedIcon sized to the empty state. */
  icon?: IconName | IconComponent;
  /** Anything else in the media slot, such as an illustration. Overrides `icon`. */
  media?: Snippet;
  /** The way out: one primary action, and at most one secondary. */
  actions?: Snippet;
  /** `sm` for a table cell or a card, `md` for a panel, `lg` for a page. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Render the title as a heading at this level. Without it the title is a paragraph. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  class?: string;
}
