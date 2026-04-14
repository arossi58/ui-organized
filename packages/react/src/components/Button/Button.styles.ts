import { cva, type VariantProps } from "class-variance-authority";

export const buttonStyles = cva("btn", {
  variants: {
    intent: {
      primary:           "btn--primary",
      secondary:         "btn--secondary",
      tertiary:          "btn--tertiary",
      ghost:             "btn--ghost",
      destructive:       "btn--destructive",
      "destructive-ghost": "btn--destructive-ghost",
    },
    size: {
      sm: "btn--sm",
      md: "btn--md",
      lg: "btn--lg",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
});

export type ButtonVariants = VariantProps<typeof buttonStyles>;
