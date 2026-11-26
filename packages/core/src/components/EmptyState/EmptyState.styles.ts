import { cva, type VariantProps } from "class-variance-authority";
import type { FeaturedIconSize } from "../FeaturedIcon/FeaturedIcon.styles.js";

/**
 * What to show when there is nothing to show: a media slot (a FeaturedIcon by
 * default), a title, a line of description and the actions that get the reader
 * out of the empty state.
 *
 * `sm` fits a table cell or a card, `md` a panel, `lg` a page.
 */
export const emptyStateStyles = cva("empty-state", {
  variants: {
    size: {
      sm: "empty-state--sm",
      md: "empty-state--md",
      lg: "empty-state--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type EmptyStateVariants = VariantProps<typeof emptyStateStyles>;

export type EmptyStateSize = "sm" | "md" | "lg";

/** The FeaturedIcon size the `icon` shorthand renders at, per empty-state size. */
export const EMPTY_STATE_ICON_SIZE: Record<EmptyStateSize, FeaturedIconSize> = {
  sm: "md",
  md: "lg",
  lg: "xl",
};

/** The type class each part takes, per size. */
export const EMPTY_STATE_TEXT_CLASS: Record<EmptyStateSize, { title: string; description: string }> = {
  sm: { title: "text-default-body-large", description: "text-default-body-medium" },
  md: { title: "text-default-heading-small", description: "text-default-body-medium" },
  lg: { title: "text-default-heading-medium", description: "text-default-body-large" },
};
