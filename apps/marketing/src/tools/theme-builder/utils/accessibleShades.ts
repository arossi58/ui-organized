/**
 * Accessible primary-shade logic for the brand ramp — the single source of truth
 * shared by the color store (auto-selecting a shade when the brand changes) and
 * the Color panel's shade picker (which only renders these shades).
 *
 * A shade is judged by the label it will actually get. The resolver
 * (`pickPrimaryLabel` in @ui-organized/utils) puts near-white text on a fill
 * when that clears 4.5:1 and near-black text when it doesn't, so light brands
 * like candlelight keep their true 1400 with a dark label instead of being
 * forced down to a muddy 1800 under white text.
 */

import {
  CORE_STEPS,
  getCoreFamily,
  pickPrimaryLabel,
  type ColorRamp,
  type PrimaryLabel,
} from "@ui-organized/utils";

/**
 * Upper bound on label contrast. A fill that reads above this with its label is
 * effectively black (under a white label) or effectively white (under a black
 * one) and stops reading as a brand colour. 12 keeps a healthy band and never
 * drops the curated default 1400.
 */
export const PRIMARY_MAX_CONTRAST = 12;

/**
 * Lightest step offered as a primary. Steps 100–900 are the ramp's tints, used
 * for subtle backgrounds; a pale fill with a dark label passes contrast but no
 * longer reads as the primary action. 1000 is the lightest the picker offered
 * before labels could flip.
 */
export const PRIMARY_MIN_STEP = "1000";

const GREY = getCoreFamily("grey");

export function contrastLevel(ratio: number): "AAA" | "AA" | "fail" {
  if (ratio >= 7)   return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}

/** The button label the resolver will put on this fill, and its contrast. */
export function primaryLabelFor(hex: string, neutralRamp: ColorRamp = GREY): PrimaryLabel {
  return pickPrimaryLabel(hex, neutralRamp);
}

// ─── Accessible primary shades ──────────────────────────────────────────────

/** True when a shade's resolved label clears AA and the fill isn't near-black or near-white. */
export function isAccessiblePrimary(hex: string | undefined, neutralRamp: ColorRamp = GREY): boolean {
  if (!hex) return false;
  const { ratio } = primaryLabelFor(hex, neutralRamp);
  return ratio >= 4.5 && ratio <= PRIMARY_MAX_CONTRAST;
}

/** The brand-ramp steps that are valid primary colours, in ramp order. */
export function getAccessibleShades(ramp: ColorRamp, neutralRamp: ColorRamp = GREY): string[] {
  const first = CORE_STEPS.indexOf(PRIMARY_MIN_STEP);
  return CORE_STEPS.slice(first).filter((s) => isAccessiblePrimary(ramp[s]?.hex, neutralRamp));
}

/**
 * Choose an accessible primary shade for `ramp`: keep `preferred` if it's still
 * accessible, otherwise snap to the nearest accessible shade by ramp position
 * (ties resolve to the darker / higher-contrast side). Falls back to `preferred`
 * only when the ramp has no accessible shade at all (not expected for real hues).
 */
export function pickAccessibleShade(
  ramp: ColorRamp,
  preferred: string,
  neutralRamp: ColorRamp = GREY,
): string {
  const valid = getAccessibleShades(ramp, neutralRamp);
  if (valid.length === 0) return preferred;
  if (valid.includes(preferred)) return preferred;

  const target = CORE_STEPS.indexOf(preferred);
  let best = valid[0]!;
  let bestDist = Infinity;
  for (const s of valid) {
    const dist = Math.abs(CORE_STEPS.indexOf(s) - target);
    if (dist < bestDist || (dist === bestDist && CORE_STEPS.indexOf(s) > CORE_STEPS.indexOf(best))) {
      bestDist = dist;
      best = s;
    }
  }
  return best;
}
