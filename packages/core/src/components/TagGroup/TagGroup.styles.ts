import { cva, type VariantProps } from "class-variance-authority";

/**
 * The announcement pill: a tinted pill holding a solid pill Tag and a message,
 * "New ▸ We've shipped dark mode". One pill, not a list of tags.
 */
export const tagGroupStyles = cva("tag-group", {
  variants: {
    variant: {
      brand:            "tag-group--brand",
      neutral:          "tag-group--neutral",
      success:          "tag-group--success",
      info:             "tag-group--info",
      "info-secondary": "tag-group--info-secondary",
      caution:          "tag-group--caution",
      error:            "tag-group--error",
    },
    size: {
      md: "tag-group--md",
      lg: "tag-group--lg",
    },
    tagPosition: {
      leading:  "",
      trailing: "tag-group--trailing",
    },
  },
  defaultVariants: {
    variant: "brand",
    size: "md",
    tagPosition: "leading",
  },
});

export type TagGroupVariants = VariantProps<typeof tagGroupStyles>;

export type TagGroupSize = "md" | "lg";

/** The inner Tag's size and the message's type class, per TagGroup size. */
export const TAG_GROUP_TAG_SIZE: Record<TagGroupSize, "md" | "lg"> = { md: "md", lg: "lg" };
export const TAG_GROUP_TEXT_CLASS: Record<TagGroupSize, string> = {
  md: "text-default-body-small",
  lg: "text-default-body-medium",
};
/** The trailing chevron's edge (px), per size. */
export const TAG_GROUP_ICON_SIZE: Record<TagGroupSize, number> = { md: 16, lg: 16 };
