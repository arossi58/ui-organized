import { cva, type VariantProps } from "class-variance-authority";

export const separatorStyles = cva("separator", {
  variants: {
    orientation: {
      horizontal: "separator--horizontal",
      vertical:   "separator--vertical",
    },
    spacing: {
      none: "separator--spacing-none",
      sm:   "separator--spacing-sm",
      md:   "separator--spacing-md",
      lg:   "separator--spacing-lg",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    spacing:     "md",
  },
});

export type SeparatorVariants = VariantProps<typeof separatorStyles>;
