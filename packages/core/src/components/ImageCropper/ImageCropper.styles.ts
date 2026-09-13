import { cva, type VariantProps } from "class-variance-authority";

/**
 * Composes the shared `.field` layout so the label and helper text match every
 * other form control; the viewport is cropper-specific.
 */
export const imageCropperStyles = cva("field image-cropper", {
  variants: {
    size: {
      sm: "field--sm image-cropper--sm",
      md: "field--md image-cropper--md",
      lg: "field--lg image-cropper--lg",
    },
    cropShape: {
      rectangle: "image-cropper--rectangle",
      circle: "image-cropper--circle",
    },
  },
  defaultVariants: {
    size: "md",
    cropShape: "rectangle",
  },
});

export type ImageCropperVariants = VariantProps<typeof imageCropperStyles>;
