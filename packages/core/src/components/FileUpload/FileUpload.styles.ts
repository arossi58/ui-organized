import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the dropzone and the file list are upload-specific.
 */
export const fileUploadStyles = cva("field file-upload", {
  variants: {
    size: {
      sm: "field--sm file-upload--sm",
      md: "field--md file-upload--md",
      lg: "field--lg file-upload--lg",
    },
    variant: {
      dropzone: "file-upload--dropzone",
      button: "file-upload--button",
      compact: "file-upload--compact",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "dropzone",
  },
});

export type FileUploadVariants = VariantProps<typeof fileUploadStyles>;
