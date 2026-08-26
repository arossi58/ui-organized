import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the trigger and the portalled picker are colour-specific.
 */
export const colorPickerStyles = cva("field color-picker", {
  variants: {
    size: {
      sm: "field--sm color-picker--sm",
      md: "field--md color-picker--md",
      lg: "field--lg color-picker--lg",
    },
    variant: {
      default: "color-picker--default",
      "swatch-only": "color-picker--swatch-only",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type ColorPickerVariants = VariantProps<typeof colorPickerStyles>;
