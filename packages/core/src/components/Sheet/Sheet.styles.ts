import { cva, type VariantProps } from "class-variance-authority";

export const sheetStyles = cva("sheet__popup", {
  variants: {
    side: {
      top:    "sheet__popup--top",
      right:  "sheet__popup--right",
      bottom: "sheet__popup--bottom",
      left:   "sheet__popup--left",
    },
    size: {
      sm: "sheet__popup--sm",
      md: "sheet__popup--md",
      lg: "sheet__popup--lg",
    },
  },
  defaultVariants: {
    side: "right",
    size: "md",
  },
});

export type SheetVariants = VariantProps<typeof sheetStyles>;
