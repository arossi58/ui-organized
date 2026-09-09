import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the drawing surface is signature-specific.
 */
export const signaturePadStyles = cva("field signature-pad", {
  variants: {
    size: {
      sm: "field--sm signature-pad--sm",
      md: "field--md signature-pad--md",
      lg: "field--lg signature-pad--lg",
    },
    variant: {
      default: "signature-pad--default",
      bordered: "signature-pad--bordered",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type SignaturePadVariants = VariantProps<typeof signaturePadStyles>;
