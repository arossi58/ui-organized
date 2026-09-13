import { cva, type VariantProps } from "class-variance-authority";

export const qrCodeStyles = cva("qr-code", {
  variants: {
    size: {
      sm: "qr-code--sm",
      md: "qr-code--md",
      lg: "qr-code--lg",
    },
    variant: {
      default: "qr-code--default",
      framed: "qr-code--framed",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type QRCodeVariants = VariantProps<typeof qrCodeStyles>;
