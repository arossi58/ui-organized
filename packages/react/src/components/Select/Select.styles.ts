import { cva, type VariantProps } from "class-variance-authority";

export const selectFieldStyles = cva("select-field", {
  variants: {
    size: {
      sm: "select-field--sm",
      md: "select-field--md",
      lg: "select-field--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type SelectVariants = VariantProps<typeof selectFieldStyles>;
