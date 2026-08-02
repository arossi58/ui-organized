import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the dial below it is angle-slider-specific.
 */
export const angleSliderStyles = cva("field angle-slider", {
  variants: {
    size: {
      sm: "field--sm angle-slider--sm",
      md: "field--md angle-slider--md",
      lg: "field--lg angle-slider--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type AngleSliderVariants = VariantProps<typeof angleSliderStyles>;
