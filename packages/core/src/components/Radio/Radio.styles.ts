import { cva, type VariantProps } from "class-variance-authority";

export const radioGroupStyles = cva("radio-group", {
  variants: {
    orientation: {
      vertical:   "radio-group--vertical",
      horizontal: "radio-group--horizontal",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export type RadioGroupVariants = VariantProps<typeof radioGroupStyles>;
