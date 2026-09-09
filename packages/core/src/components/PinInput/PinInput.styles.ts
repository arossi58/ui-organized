import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout (label / control / description stack) so
 * the label and helper text match every other form control, and layers the
 * pin-specific cell row on top of it.
 */
export const pinInputStyles = cva("field pin-input", {
  variants: {
    size: {
      sm: "field--sm pin-input--sm",
      md: "field--md pin-input--md",
      lg: "field--lg pin-input--lg",
    },
    variant: {
      default: "pin-input--default",
      underline: "pin-input--underline",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type PinInputVariants = VariantProps<typeof pinInputStyles>;
