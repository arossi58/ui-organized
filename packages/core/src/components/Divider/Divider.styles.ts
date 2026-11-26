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
    /** A divider that holds text or a control. Horizontal only. */
    labelled: {
      true: "divider--labelled",
    },
    /** Where the label sits. Only applies with `labelled`. */
    labelPosition: {
      start:  "divider--label-start",
      center: "divider--label-center",
      end:    "divider--label-end",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    spacing:     "none",
  },
});

export type DividerVariants = VariantProps<typeof dividerStyles>;
