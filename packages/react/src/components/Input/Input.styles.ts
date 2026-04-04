import { cva, type VariantProps } from "class-variance-authority";

export const inputFieldStyles = cva("input-field", {
  variants: {
    size: {
      sm: "input-field--sm",
      md: "input-field--md",
      lg: "input-field--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type InputVariants = VariantProps<typeof inputFieldStyles>;
