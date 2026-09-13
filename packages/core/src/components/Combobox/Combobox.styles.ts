import { cva, type VariantProps } from "class-variance-authority";

/**
 * Reuses the shared field chrome (`.field`, `.field--{size}`) so the label,
 * description and control padding match Input/Select. The size class drives the
 * input padding via the shared `.field--{size} .field__control` rules.
 */
export const comboboxFieldStyles = cva("field", {
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

export type ComboboxVariants = VariantProps<typeof comboboxFieldStyles>;
