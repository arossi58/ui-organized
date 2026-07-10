import { cva, type VariantProps } from "class-variance-authority";

export const tagStyles = cva("tag", {
  variants: {
    variant: {
      success:          "tag--success",
      info:             "tag--info",
      "info-secondary": "tag--info-secondary",
      caution:          "tag--caution",
      warning:          "tag--warning",
      error:            "tag--error",
    },
    size: {
      sm: "tag--sm",
      md: "tag--md",
      lg: "tag--lg",
    },
  },
  defaultVariants: {
    variant: "success",
    size: "md",
  },
});

export type TagVariants = VariantProps<typeof tagStyles>;
