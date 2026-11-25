import { cva, type VariantProps } from "class-variance-authority";

/**
 * `appearance` maps onto the classes Tag has always emitted: `solid` adds none,
 * `subtle` is the existing `tag--subdued`, and `outline` is subdued plus a ring.
 * So a Tag written before the axis existed renders the same DOM it always did.
 */
export const tagStyles = cva("tag", {
  variants: {
    variant: {
      success:          "tag--success",
      info:             "tag--info",
      "info-secondary": "tag--info-secondary",
      caution:          "tag--caution",
      error:            "tag--error",
      brand:            "tag--brand",
      neutral:          "tag--neutral",
    },
    size: {
      sm: "tag--sm",
      md: "tag--md",
      lg: "tag--lg",
    },
    appearance: {
      solid:   "",
      subtle:  "tag--subdued",
      outline: "tag--subdued tag--outline",
    },
    shape: {
      square: "",
      pill:   "tag--pill",
    },
  },
  defaultVariants: {
    variant: "success",
    size: "md",
    appearance: "solid",
    shape: "square",
  },
});

export type TagVariants = VariantProps<typeof tagStyles>;

export type TagAppearance = "solid" | "subtle" | "outline";

/**
 * `appearance` if given, else the deprecated `emphasized` (`false` → subtle),
 * else solid. Shared so the four libraries resolve the alias identically.
 */
export function resolveTagAppearance(appearance?: TagAppearance | null, emphasized?: boolean | null): TagAppearance {
  if (appearance) return appearance;
  return emphasized === false ? "subtle" : "solid";
}
