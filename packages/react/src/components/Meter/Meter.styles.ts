import { cva, type VariantProps } from "class-variance-authority";

export const meterStyles = cva("meter", {
  variants: {
    variant: {
      default: "meter--default",
      success: "meter--success",
      warning: "meter--warning",
      error:   "meter--error",
    },
    size: {
      sm: "meter--sm",
      md: "meter--md",
      lg: "meter--lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size:    "md",
  },
});

export type MeterVariants = VariantProps<typeof meterStyles>;
