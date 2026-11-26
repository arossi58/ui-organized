import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";
import { cardStyles } from "../Card/Card.styles.js";
import type { SystemGlyph } from "../../icons/systemGlyphs.js";

/**
 * One number and what it means: a label, the value, and how it has moved.
 * `card` puts it on a Card's surface (the default); `plain` sits it in whatever
 * surface holds it, such as a row of stats inside one card.
 */
export const statStyles = cva("stat", {
  variants: {
    variant: {
      card: "stat--card",
      plain: "stat--plain",
    },
    size: {
      sm: "stat--sm",
      md: "stat--md",
      lg: "stat--lg",
    },
  },
  defaultVariants: {
    variant: "card",
    size: "md",
  },
});

export type StatVariants = VariantProps<typeof statStyles>;
export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down" | "flat";
export type StatSentiment = "positive" | "negative" | "neutral";

/** The card's padding per size, so a small stat is not swamped by its own frame. */
const CARD_PADDING: Record<StatSize, "sm" | "md" | "lg"> = { sm: "sm", md: "md", lg: "lg" };

/** The Stat's classes: a Card's surface under the card variant, plus its own. */
export function statClass(variant: "card" | "plain" = "card", size: StatSize = "md"): string {
  return clsx(
    variant === "card" && cardStyles({ padding: CARD_PADDING[size] }),
    statStyles({ variant, size }),
  );
}

/**
 * Whether the change is good news. Up is positive and down negative unless
 * `sentiment` says otherwise, which it must for a number where up is bad, such
 * as a refund rate or a response time.
 */
export function resolveStatSentiment(trend?: StatTrend, sentiment?: StatSentiment): StatSentiment {
  if (sentiment) return sentiment;
  if (trend === "up") return "positive";
  if (trend === "down") return "negative";
  return "neutral";
}

/** The Tag variant the delta takes, per sentiment. */
export const STAT_SENTIMENT_TAG_VARIANT: Record<StatSentiment, "success" | "error" | "neutral"> = {
  positive: "success",
  negative: "error",
  neutral: "neutral",
};

/** The glyph drawn in the delta, per trend. */
export const STAT_TREND_GLYPH: Record<StatTrend, SystemGlyph> = {
  up: "chevron-up",
  down: "chevron-down",
  flat: "minus",
};

/** What a screen reader hears before the delta, per trend. The arrow alone says nothing. */
export const STAT_TREND_LABEL: Record<StatTrend, string> = {
  up: "Increase",
  down: "Decrease",
  flat: "No change",
};

/** The type class each part takes, per size. */
export const STAT_TEXT_CLASS: Record<
  StatSize,
  { label: string; value: string; description: string }
> = {
  sm: {
    label: "text-default-body-small",
    value: "text-heavy-heading-small",
    description: "text-default-body-small",
  },
  md: {
    label: "text-default-body-medium",
    value: "text-heavy-heading-medium",
    description: "text-default-body-small",
  },
  lg: {
    label: "text-default-body-medium",
    value: "text-heavy-heading-large",
    description: "text-default-body-medium",
  },
};
