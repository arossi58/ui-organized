import { cva, type VariantProps } from "class-variance-authority";

export const inputFieldStyles = cva("field", {
  variants: {
    size: {
      sm: "field--sm",
      md: "field--md",
      lg: "field--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type InputVariants = VariantProps<typeof inputFieldStyles>;
