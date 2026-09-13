import { cva, type VariantProps } from "class-variance-authority";

export const fieldStyles = cva("field", {
  variants: {
    layout: {
      stacked: "field--stacked",
      inline:  "field--inline",
    },
  },
  defaultVariants: {
    layout: "stacked",
  },
});

export type FieldVariants = VariantProps<typeof fieldStyles>;
