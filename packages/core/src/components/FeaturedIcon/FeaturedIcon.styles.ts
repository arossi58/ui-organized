import { cva, type VariantProps } from "class-variance-authority";

/**
 * An icon in a tinted shape: the smallest piece empty states, modal headers,
 * feature grids and metric cards share.
 *
 * `appearance` is the same axis Tag takes: `subtle` (a tint with the colour's
 * content tone), `solid` (the full colour with a label that reads on it) and
 * `outline` (no fill, two faded rings).
 */
export const featuredIconStyles = cva("featured-icon", {
  variants: {
    variant: {
      brand:   "featured-icon--brand",
      neutral: "featured-icon--neutral",
      success: "featured-icon--success",
      info:    "featured-icon--info",
      caution: "featured-icon--caution",
      error:   "featured-icon--error",
    },
    appearance: {
      subtle:  "featured-icon--subtle",
      solid:   "featured-icon--solid",
      outline: "featured-icon--outline",
    },
    shape: {
      circle: "featured-icon--circle",
      square: "featured-icon--square",
    },
    size: {
      sm: "featured-icon--sm",
      md: "featured-icon--md",
      lg: "featured-icon--lg",
      xl: "featured-icon--xl",
    },
  },
  defaultVariants: {
    variant: "brand",
    appearance: "subtle",
    shape: "circle",
    size: "md",
  },
});

export type FeaturedIconVariants = VariantProps<typeof featuredIconStyles>;

export type FeaturedIconSize = "sm" | "md" | "lg" | "xl";

/**
 * The glyph's edge (px) per size: half the shape, so 32/40/48/56 px shapes hold
 * 16/20/24/28 px icons. Shared so the four libraries size the icon identically.
 */
export const FEATURED_ICON_GLYPH_SIZE: Record<FeaturedIconSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
};
