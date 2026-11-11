/**
 * Public family lookup for theming.
 *
 * Brand and status families come back as authored. Neutral families are
 * re-derived through {@link getNeutralRamp} so that every neutral shares grey's
 * per-step lightness: the semantic map references neutrals by fixed step, and
 * the authored tinted families diverge from grey by up to 23 L* mid-ramp, which
 * failed dark-mode text contrast on 10 of 11 families.
 *
 * Lives apart from coreColors.ts because neutralGeneration.ts imports that
 * module; putting this there would make an import cycle.
 */

import type { ColorRamp } from "./colorGeneration.js";
import { getAuthoredFamily, NEUTRAL_FAMILY_NAMES } from "./coreColors.js";
import { getNeutralRamp } from "./neutralGeneration.js";

/**
 * Look up a family ramp by name; falls back to grey if unknown. Neutral
 * families return the lightness-normalized derived ramp — use
 * `getAuthoredFamily` to display the palette exactly as authored.
 */
export function getCoreFamily(name: string): ColorRamp {
  return NEUTRAL_FAMILY_NAMES.includes(name) ? getNeutralRamp(name) : getAuthoredFamily(name);
}
