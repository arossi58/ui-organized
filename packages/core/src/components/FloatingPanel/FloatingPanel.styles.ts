import { cva, type VariantProps } from "class-variance-authority";

export const floatingPanelStyles = cva("floating-panel__content", {
  variants: {
    size: {
      sm: "floating-panel__content--sm",
      md: "floating-panel__content--md",
      lg: "floating-panel__content--lg",
    },
    variant: {
      default: "floating-panel__content--default",
      elevated: "floating-panel__content--elevated",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type FloatingPanelVariants = VariantProps<typeof floatingPanelStyles>;
