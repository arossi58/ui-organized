import { cva, type VariantProps } from "class-variance-authority";

export const stepsStyles = cva("steps", {
  variants: {
    orientation: {
      horizontal: "steps--horizontal",
      vertical: "steps--vertical",
    },
    size: {
      sm: "steps--sm",
      md: "steps--md",
      lg: "steps--lg",
    },
    variant: {
      numbered: "steps--numbered",
      dotted: "steps--dotted",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    size: "md",
    variant: "numbered",
  },
});

export type StepsVariants = VariantProps<typeof stepsStyles>;
