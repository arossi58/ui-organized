import { cva, type VariantProps } from "class-variance-authority";

export const accordionStyles = cva("accordion", {
  variants: {
    variant: {
      default:   "accordion--default",
      bordered:  "accordion--bordered",
      separated: "accordion--separated",
    },
    size: {
      sm: "accordion--sm",
      md: "accordion--md",
      lg: "accordion--lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size:    "md",
  },
});

export type AccordionVariants = VariantProps<typeof accordionStyles>;
