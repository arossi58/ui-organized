import { cva, type VariantProps } from "class-variance-authority";

export const badgeStyles = cva("badge", {
  variants: {
    variant: {
      default: "badge--default",
      success: "badge--success",
      warning: "badge--warning",
      error:   "badge--error",
      info:    "badge--info",
    },
    size: {
      sm: "badge--sm",
      md: "badge--md",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type BadgeVariants = VariantProps<typeof badgeStyles>;
