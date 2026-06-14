import { cva, type VariantProps } from "class-variance-authority";

export const tabsStyles = cva("tabs", {
  variants: {
    orientation: {
      horizontal: "tabs--horizontal",
      vertical:   "tabs--vertical",
    },
    size: {
      default: "tabs--default",
      small:   "tabs--small",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    size:        "default",
  },
});

export type TabsVariants = VariantProps<typeof tabsStyles>;
