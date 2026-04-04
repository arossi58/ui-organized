import { cva, type VariantProps } from "class-variance-authority";

export const tabsStyles = cva("tabs", {
  variants: {
    orientation: {
      horizontal: "tabs--horizontal",
      vertical:   "tabs--vertical",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type TabsVariants = VariantProps<typeof tabsStyles>;
