import { cva, type VariantProps } from "class-variance-authority";

export const rangeStyles = cva("range", {
  variants: {
    size: {
      sm: "range--sm",
      md: "range--md",
      lg: "range--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type RangeVariants = VariantProps<typeof rangeStyles>;
