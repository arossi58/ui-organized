import { cva, type VariantProps } from "class-variance-authority";

export const timerStyles = cva("timer", {
  variants: {
    size: {
      sm: "timer--sm",
      md: "timer--md",
      lg: "timer--lg",
    },
    variant: {
      default: "timer--default",
      boxed: "timer--boxed",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type TimerVariants = VariantProps<typeof timerStyles>;
