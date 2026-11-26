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
    /**
     * `underline` is the original look: a rule under the list and a bar under
     * the selected tab. `pill` fills the selected tab with the brand tint, and
     * `bordered` sits the tabs in a track with the selected one raised.
     */
    variant: {
      underline: "tabs--underline",
      pill:      "tabs--pill",
      bordered:  "tabs--bordered",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    size:        "default",
    variant:     "underline",
  },
});

export type TabsVariants = VariantProps<typeof tabsStyles>;
