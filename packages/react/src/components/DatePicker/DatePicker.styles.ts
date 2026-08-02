import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control. Mirrors `Select`'s `default | ghost` axis, since the two
 * sit next to each other in most forms.
 */
export const datePickerStyles = cva("field date-picker", {
  variants: {
    size: {
      sm: "field--sm date-picker--sm",
      md: "field--md date-picker--md",
      lg: "field--lg date-picker--lg",
    },
    variant: {
      default: "date-picker--default",
      ghost: "date-picker--ghost",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type DatePickerVariants = VariantProps<typeof datePickerStyles>;
