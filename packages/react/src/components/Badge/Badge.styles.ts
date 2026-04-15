import { cva, type VariantProps } from "class-variance-authority";

export const badgeStyles = cva("badge", {
  variants: {
    variant: {
      success:          "badge--success",
      info:             "badge--info",
      "info-secondary": "badge--info-secondary",
      caution:          "badge--caution",
      warning:          "badge--warning",
      error:            "badge--error",
    },
    size: {
      sm: "badge--sm",
      md: "badge--md",
      lg: "badge--lg",
    },
  },
  defaultVariants: {
    variant: "success",
    size: "md",
  },
});

export type BadgeVariants = VariantProps<typeof badgeStyles>;
