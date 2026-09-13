import { cva, type VariantProps } from "class-variance-authority";

export const cardStyles = cva("card", {
  variants: {
    variant: {
      default:  "card--default",
      elevated: "card--elevated",
    },
    padding: {
      none: "card--padding-none",
      sm:   "card--padding-sm",
      md:   "card--padding-md",
      lg:   "card--padding-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export type CardVariants = VariantProps<typeof cardStyles>;
