import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the star row itself is rating-specific.
 */
export const ratingGroupStyles = cva("field rating-group", {
  variants: {
    size: {
      sm: "field--sm rating-group--sm",
      md: "field--md rating-group--md",
      lg: "field--lg rating-group--lg",
    },
    variant: {
      default: "rating-group--default",
      warning: "rating-group--warning",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type RatingGroupVariants = VariantProps<typeof ratingGroupStyles>;
