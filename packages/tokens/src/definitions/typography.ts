/**
 * Canonical typography values, parsed straight from the DTCG source files.
 *
 * These are the single source of truth for the shipped type scale — the same
 * JSON that Style Dictionary builds into `variables.css`. Exporting them as
 * plain JS lets non-CSS consumers (e.g. the Theme Builder's default state) seed
 * themselves from the design system so the two stay 1:1: edit the JSON, rebuild,
 * and every consumer picks up the new values. Do not hand-edit these maps —
 * change the JSON under `src/typography/`.
 */

import fontSize from "../typography/font-size.json" with { type: "json" };
import lineHeight from "../typography/line-height.json" with { type: "json" };
import fontFamilies from "../typography/font-families.json" with { type: "json" };
import fontWeight from "../typography/font-weight.json" with { type: "json" };

/** Strip the `px` suffix from a DTCG dimension `$value`. */
function px(value: string): number {
  return parseFloat(value);
}

/** Map a DTCG dimension group to `{ step: pixelNumber }`. */
function pxMap(group: Record<string, { $value: string }>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [step, token] of Object.entries(group)) {
    out[step] = px(token.$value);
  }
  return out;
}

/** Canonical font sizes per step (px), e.g. `{ "body-medium": 14, … }`. */
export const typeSizeTokens: Record<string, number> = pxMap(fontSize.type.size);

/** Canonical line-heights per step (px), e.g. `{ "body-medium": 20, … }`. */
export const typeLeadingTokens: Record<string, number> = pxMap(lineHeight.type.leading);

/** Canonical font families for the heading and body roles. */
export const typeFontTokens = {
  heading: fontFamilies.type.font.heading.$value,
  body: fontFamilies.type.font.body.$value,
} as const;

/** Weight roles → numeric weights, keyed default/emphasis/strong/heavy. */
type WeightRoles = { default: number; emphasis: number; strong: number; heavy: number };

const weights = fontWeight.type.weight;

/** Canonical font weights for the body and heading roles. */
export const typeWeightTokens: { body: WeightRoles; heading: WeightRoles } = {
  body: {
    default: weights.body.default.$value,
    emphasis: weights.body.emphasis.$value,
    strong: weights.body.strong.$value,
    heavy: weights.body.heavy.$value,
  },
  heading: {
    default: weights.heading.default.$value,
    emphasis: weights.heading.emphasis.$value,
    strong: weights.heading.strong.$value,
    heavy: weights.heading.heavy.$value,
  },
};
