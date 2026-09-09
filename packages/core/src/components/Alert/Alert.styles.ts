import { cva, type VariantProps } from "class-variance-authority";

export const alertStyles = cva("alert", {
  variants: {
    variant: {
      info:    "alert--info",
      success: "alert--success",
      warning: "alert--warning",
      error:   "alert--error",
    },
  },
  defaultVariants: {
    variant: "info",
  },
});

export type AlertVariants = VariantProps<typeof alertStyles>;
