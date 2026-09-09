import { cva, type VariantProps } from "class-variance-authority";

export const toggleStyles = cva("toggle", {
  variants: {
    size: {
      sm: "toggle--sm",
      md: "toggle--md",
      lg: "toggle--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ToggleVariants = VariantProps<typeof toggleStyles>;
