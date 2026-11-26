import { cva, type VariantProps } from "class-variance-authority";

/**
 * Terms and their details: a record's fields on a detail page, a settings
 * summary, an order's line items. `inline` puts each term beside its details,
 * with every term in one column; `stacked` puts the details under the term.
 */
export const descriptionListStyles = cva("description-list", {
  variants: {
    layout: {
      inline: "description-list--inline",
      stacked: "description-list--stacked",
    },
    size: {
      sm: "description-list--sm",
      md: "description-list--md",
    },
    divided: {
      true: "description-list--divided",
    },
  },
  defaultVariants: {
    layout: "inline",
    size: "md",
  },
});

export type DescriptionListVariants = VariantProps<typeof descriptionListStyles>;
