import { cva, type VariantProps } from "class-variance-authority";

export const dividerStyles = cva("divider", {
  variants: {
    orientation: {
      horizontal: "divider--horizontal",
      vertical:   "divider--vertical",
    },
    spacing: {
      none: "divider--spacing-none",
      sm:   "divider--spacing-sm",
      md:   "divider--spacing-md",
      lg:   "divider--spacing-lg",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    spacing:     "none",
  },
});

export type DividerVariants = VariantProps<typeof dividerStyles>;
