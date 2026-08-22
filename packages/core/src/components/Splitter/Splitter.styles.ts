import { cva, type VariantProps } from "class-variance-authority";

export const splitterStyles = cva("splitter", {
  variants: {
    orientation: {
      horizontal: "splitter--horizontal",
      vertical: "splitter--vertical",
    },
    variant: {
      default: "splitter--default",
      subtle: "splitter--subtle",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
  },
});

export type SplitterVariants = VariantProps<typeof splitterStyles>;
