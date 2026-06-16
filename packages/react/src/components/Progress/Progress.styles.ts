import { cva, type VariantProps } from "class-variance-authority";

export const progressStyles = cva("progress", {
  variants: {
    variant: {
      default: "progress--default",
      success: "progress--success",
      warning: "progress--warning",
      error:   "progress--error",
    },
    size: {
      sm: "progress--sm",
      md: "progress--md",
      lg: "progress--lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size:    "md",
  },
});

export type ProgressVariants = VariantProps<typeof progressStyles>;
