import { cva, type VariantProps } from "class-variance-authority";

export const listboxStyles = cva("listbox", {
  variants: {
    size: {
      sm: "listbox--sm",
      md: "listbox--md",
      lg: "listbox--lg",
    },
    variant: {
      default: "listbox--default",
      bordered: "listbox--bordered",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type ListboxVariants = VariantProps<typeof listboxStyles>;
