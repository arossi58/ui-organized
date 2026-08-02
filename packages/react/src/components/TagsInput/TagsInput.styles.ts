import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control. The control itself is a wrapping tag well rather than a
 * single-line box, so it opts out of the shared height rule — see TagsInput.css.
 */
export const tagsInputStyles = cva("field tags-input", {
  variants: {
    size: {
      sm: "field--sm tags-input--sm",
      md: "field--md tags-input--md",
      lg: "field--lg tags-input--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type TagsInputVariants = VariantProps<typeof tagsInputStyles>;
