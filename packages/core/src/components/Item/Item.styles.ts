import { cva, type VariantProps } from "class-variance-authority";

/**
 * A row: media, a title with a line of description, and actions at the end.
 * With a link, the whole row is the link's hit area, by a stretched link, and
 * the actions stay separately clickable above it.
 */
export const itemStyles = cva("item", {
  variants: {
    variant: {
      plain: "item--plain",
      outline: "item--outline",
      muted: "item--muted",
    },
    size: {
      sm: "item--sm",
      md: "item--md",
    },
    link: {
      true: "item--link",
      false: "",
    },
  },
  defaultVariants: {
    variant: "plain",
    size: "md",
    link: false,
  },
});

export type ItemVariants = VariantProps<typeof itemStyles>;
export type ItemSize = "sm" | "md";
export type ItemVariant = "plain" | "outline" | "muted";

/**
 * Rows that belong together, as a list. `divided` (the default) draws a rule
 * between them; `outline` puts the whole group in one frame.
 */
export const itemGroupStyles = cva("item-group", {
  variants: {
    variant: {
      plain: "item-group--plain",
      outline: "item-group--outline",
    },
    divided: {
      true: "item-group--divided",
      false: "",
    },
  },
  defaultVariants: {
    variant: "plain",
    divided: true,
  },
});

export type ItemGroupVariants = VariantProps<typeof itemGroupStyles>;

/** The type class each part takes, per size. */
export const ITEM_TEXT_CLASS: Record<ItemSize, { title: string; description: string }> = {
  sm: { title: "text-emphasis-body-small", description: "text-default-body-small" },
  md: { title: "text-emphasis-body-medium", description: "text-default-body-small" },
};

/** The icon's size inside its tile, per size. The tile is 32px at sm and 40px at md. */
export const ITEM_ICON_SIZE: Record<ItemSize, number> = { sm: 16, md: 20 };
