import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the preview/input swap below it is editable-specific.
 */
export const editableStyles = cva("field editable", {
  variants: {
    size: {
      sm: "field--sm editable--sm",
      md: "field--md editable--md",
      lg: "field--lg editable--lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type EditableVariants = VariantProps<typeof editableStyles>;
