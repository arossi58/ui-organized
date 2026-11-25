import { cva, type VariantProps } from "class-variance-authority";

/**
 * A single choice from a set of cards. The card styles are shared with
 * CheckboxCardGroup, in `SelectionCard/SelectionCard.css`; each control keeps
 * its own look from `Radio.css`.
 */
export const radioCardGroupStyles = cva("selection-card-group radio-card-group", {
  variants: {
    size: {
      sm: "selection-card-group--sm",
      md: "selection-card-group--md",
    },
    /** Cards per row. One column stacks them. */
    columns: {
      1: "selection-card-group--columns-1",
      2: "selection-card-group--columns-2",
      3: "selection-card-group--columns-3",
      4: "selection-card-group--columns-4",
    },
    invalid: {
      true: "selection-card-group--invalid",
    },
  },
  defaultVariants: {
    size: "md",
    columns: 1,
  },
});

export type RadioCardGroupVariants = VariantProps<typeof radioCardGroupStyles>;
