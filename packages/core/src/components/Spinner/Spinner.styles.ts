import { cva, type VariantProps } from "class-variance-authority";

/**
 * sm, md and lg are 16, 20 and 24 px: the same edges as `CONTROL_ICON_SIZE`, so
 * a spinner can take a control's icon slot without the control changing size.
 * xl (40 px) is for a region or a page that is loading on its own.
 */
export const spinnerStyles = cva("spinner", {
  variants: {
    size: {
      sm: "spinner--sm",
      md: "spinner--md",
      lg: "spinner--lg",
      xl: "spinner--xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type SpinnerVariants = VariantProps<typeof spinnerStyles>;
