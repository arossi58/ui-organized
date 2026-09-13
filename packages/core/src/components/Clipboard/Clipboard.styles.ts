import { cva, type VariantProps } from "class-variance-authority";

/**
 * The `input` variant composes the shared `.field` layout so a copyable value
 * sits in a form beside real inputs; the `button` variant is the trigger alone
 * and needs no field chrome, but keeps the same class so label and helper text
 * still work if supplied.
 */
export const clipboardStyles = cva("field clipboard", {
  variants: {
    size: {
      sm: "field--sm clipboard--sm",
      md: "field--md clipboard--md",
      lg: "field--lg clipboard--lg",
    },
    variant: {
      input: "clipboard--input",
      button: "clipboard--button",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "input",
  },
});

export type ClipboardVariants = VariantProps<typeof clipboardStyles>;
