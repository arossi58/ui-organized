import { cva, type VariantProps } from "class-variance-authority";

export const marqueeStyles = cva("marquee", {
  variants: {
    orientation: {
      horizontal: "marquee--horizontal",
      vertical: "marquee--vertical",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type MarqueeVariants = VariantProps<typeof marqueeStyles>;
