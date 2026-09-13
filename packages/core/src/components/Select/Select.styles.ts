import { cva, type VariantProps } from "class-variance-authority";

export const selectFieldStyles = cva("select-field", {
  variants: {
    size: {
      sm: "select-field--sm",
      md: "select-field--md",
      lg: "select-field--lg",
    },
    variant: {
      default: "",
      ghost: "select-field--ghost",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type SelectVariants = VariantProps<typeof selectFieldStyles>;
