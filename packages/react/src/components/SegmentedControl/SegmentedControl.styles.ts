import { cva, type VariantProps } from "class-variance-authority";

export const segmentedControlStyles = cva("segmented", {
  variants: {
    size: {
      sm: "segmented--sm",
      md: "segmented--md",
      lg: "segmented--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type SegmentedControlVariants = VariantProps<typeof segmentedControlStyles>;
