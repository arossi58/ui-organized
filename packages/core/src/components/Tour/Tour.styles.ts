import { cva, type VariantProps } from "class-variance-authority";

export const tourStyles = cva("tour__content", {
  variants: {
    size: {
      sm: "tour__content--sm",
      md: "tour__content--md",
      lg: "tour__content--lg",
    },
    variant: {
      default: "tour__content--default",
      compact: "tour__content--compact",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type TourVariants = VariantProps<typeof tourStyles>;
