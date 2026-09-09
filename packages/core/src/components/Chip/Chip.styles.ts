import { cva, type VariantProps } from "class-variance-authority";

export const chipStyles = cva("chip", {
  variants: {
    variant: {
      outline: "chip--outline",
      subtle: "chip--subtle",
    },
    size: {
      sm: "chip--sm",
      md: "chip--md",
      lg: "chip--lg",
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export type ChipVariants = VariantProps<typeof chipStyles>;
