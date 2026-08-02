import { cva, type VariantProps } from "class-variance-authority";

export const carouselStyles = cva("carousel", {
  variants: {
    size: {
      sm: "carousel--sm",
      md: "carousel--md",
      lg: "carousel--lg",
    },
    variant: {
      default: "carousel--default",
      minimal: "carousel--minimal",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type CarouselVariants = VariantProps<typeof carouselStyles>;
