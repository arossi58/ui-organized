import { cva, type VariantProps } from "class-variance-authority";

export const dialogStyles = cva("dialog__popup", {
  variants: {
    size: {
      sm:         "dialog__popup--sm",
      md:         "dialog__popup--md",
      lg:         "dialog__popup--lg",
      fullscreen: "dialog__popup--fullscreen",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type DialogVariants = VariantProps<typeof dialogStyles>;
