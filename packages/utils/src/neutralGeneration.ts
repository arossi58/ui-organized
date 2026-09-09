/**
 * Tinted-neutral ramp generation.
 *
 * The neutral ramp drives every surface, border, and content token, and the
 * semantic map references it by *fixed step index* (`grey.400`, `grey.2300`, …).
 * That makes lightness the one property a neutral ramp may not move: change the
 * L at a step and every contrast ratio built on it moves with it.
 *
 * So a tinted neutral here is produced by taking an existing neutral ramp and
 * varying hue and chroma while holding lightness as near fixed as sRGB allows:
 *
 *   1. Read the per-step OKLCH lightness back off the base ramp and keep it.
 *   2. Take hue from the tint color.
 *   3. Scale chroma by a per-step envelope, times a single "strength" (the peak
 *      chroma).
 *   4. Fit the result into sRGB, letting a step give up to
 *      {@link MAX_LIGHTNESS_GIVE} of lightness where the gamut is too narrow to
 *      hold the chroma otherwise (this only bites at the very light steps).
 *   5. Convert back to sRGB hex.
 *
 * Lightness is therefore preserved exactly wherever the gamut permits, and moves
 * by at most 0.02 where it does not. Across every hue and strength the largest
 * shift on a real token pair is 5.77:1 → 5.35:1, and no pair crosses a WCAG
 * threshold — so a tinted neutral stays a re-colouring rather than a
 * re-lightening. This is what the authored families do NOT do —
 * `grey` sits at L 0.673 at step 1400 while `juniper` sits at L 0.454, so
 * swapping between them darkens the UI. Re-deriving the presets through
 * {@link getNeutralRamp} normalizes that away.
 *
 * The envelope and the strength range below were measured from the ten authored
 * tinted families in `coreColors.ts`.
 */

import {
  maxChromaFor,
  oklchInGamut,
  oklchToHex,
  oklchToString,
  parseToOklch,
  type ColorRamp,
} from "./colorGeneration.js";
import { coreColors, getCoreFamily } from "./coreColors.js";

// ─── Measured constants ───────────────────────────────────────────────────────

/**
 * Per-step chroma envelope, normalized to the ramp's peak chroma.
 *
 * The plateau and the dark tail are the mean of `c / peak` across the ten
 * authored tinted neutrals, which agree on that shape tightly (sd 0.01–0.03).
 *
 * The four lightest steps are NOT the authored values. The authored families
 * taper hard at the light end (100 → 0.159) because there steps 100–400 are
 * decorative near-whites. The semantic map, though, uses those exact steps as
 * light-mode surfaces — `surface-primary` is `grey.100` — mirroring how dark
 * mode uses 2200–2400. Left authored, light mode asked for a chroma of 0.005 at
 * step 100 and rendered as flat white while dark mode tinted correctly. So the
 * light end mirrors the (gentler) dark-end profile, making the envelope
 * symmetric about the plateau, as the token usage already is.
 */
const NEUTRAL_CHROMA_ENVELOPE: Record<string, number> = {
  "100": 0.476, // mirrors 2400
  "200": 0.564, // mirrors 2300
  "300": 0.718, // mirrors 2200
  "400": 0.879, // mirrors 2100
  "500": 0.964,
  "600": 0.973,
  "700": 0.979,
  "800": 0.977,
  "900": 0.973,
  "1000": 0.971,
  "1100": 0.96,
  "1200": 0.974,
  "1300": 0.982,
  "1400": 0.98,
  "1500": 0.976,
  "1600": 0.972,
  "1700": 0.969,
  "1800": 0.972,
  "1900": 0.972,
  "2000": 0.975,
  "2100": 0.879,
  "2200": 0.718,
  "2300": 0.564,
  "2400": 0.476,
};

/**
 * Peak-chroma presets, spanning the range measured across the authored families
 * (stone 0.024 at the quietest, battleship 0.045 at the loudest).
 */
export const NEUTRAL_TINT_STRENGTHS = {
  none: 0,
  subtle: 0.02,
  /** The mean peak chroma of the ten authored tinted families. */
  medium: 0.032,
  strong: 0.045,
} as const;

/** Default tint strength — matches the saturation of the shipped tinted neutrals. */
export const DEFAULT_NEUTRAL_TINT: number = NEUTRAL_TINT_STRENGTHS.medium;

/** Largest tint strength the generator is calibrated for. */
export const MAX_NEUTRAL_TINT: number = NEUTRAL_TINT_STRENGTHS.strong;

/**
 * Weakest tint a tinted neutral may use — 20% of {@link MAX_NEUTRAL_TINT}.
 *
 * Below this the hue is present in the numbers but not really visible on screen,
 * which reads as a broken control rather than a subtle one. "No tint at all" is
 * expressed by choosing the achromatic `grey` family, not by winding the
 * strength down to nothing.
 */
export const MIN_NEUTRAL_TINT: number = 0.2 * NEUTRAL_TINT_STRENGTHS.strong;

/**
 * Below this chroma a color carries no usable hue, so tinting toward it is a
 * no-op rather than a rotation toward whatever hue the rounding produced.
 */
const ACHROMATIC_EPSILON = 0.002;

/**
 * How much OKLCH lightness a step may give up to fit its requested chroma.
 *
 * sRGB is very narrow at the extremes: at L 0.991 most hues top out around
 * chroma 0.005, so the lightest surface cannot hold a visible tint at its
 * authored lightness no matter what the envelope asks for. Rather than clamp to
 * a flat white, a step may move a bounded distance toward mid-scale to make
 * room. 0.02 is the point where the tint reads clearly and further give stops
 * buying visible chroma; the cost is bounded — the worst-affected real token
 * pair, content-placeholder on surface-primary, goes 5.77:1 to 5.35:1, and no
 * pair crosses a WCAG threshold at any hue or strength.
 */
export const MAX_LIGHTNESS_GIVE = 0.02;

// ─── Gamut fitting ────────────────────────────────────────────────────────────

interface FittedStep {
  l: number;
  c: number;
}

/**
 * Fit `c` at `l` into sRGB, preferring chroma over lightness within a bounded
 * budget.
 *
 * Returns the target unchanged when it already fits. Otherwise the step moves
 * toward mid-scale — darker at the light end, lighter at the dark end — by the
 * smallest amount that admits the chroma, up to {@link MAX_LIGHTNESS_GIVE}. If
 * the chroma still will not fit, it is reduced to what does, so the emitted
 * `oklch()` string always describes the hex beside it.
 */
function fitToGamut(l: number, c: number, h: number): FittedStep {
  if (oklchInGamut(l, c, h)) return { l, c };

  // Move away from whichever end is crowding the color.
  const direction = l > 0.5 ? -1 : 1;
  const limit = l + direction * MAX_LIGHTNESS_GIVE;

  if (maxChromaFor(limit, h) < c) {
    // Even the full budget cannot hold it — spend the budget, clamp the rest.
    return { l: limit, c: maxChromaFor(limit, h) };
  }

  // Smallest give that admits the chroma.
  let lo = 0;
  let hi = MAX_LIGHTNESS_GIVE;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (maxChromaFor(l + direction * mid, h) >= c) hi = mid;
    else lo = mid;
  }
  return { l: l + direction * hi, c };
}

// ─── Options ──────────────────────────────────────────────────────────────────

export interface NeutralRampOptions {
  /**
   * Ramp whose per-step OKLCH lightness is preserved. Defaults to the core
   * `grey` family — the achromatic reference the semantic tokens were tuned on.
   */
  baseRamp?: ColorRamp;
  /** Peak chroma of the result. Defaults to {@link DEFAULT_NEUTRAL_TINT}. */
  strength?: number;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * The ramp's dominant hue, as a circular mean over the steps that carry enough
 * chroma to have a meaningful one.
 *
 * @returns The hue in degrees, or `null` for an achromatic ramp (such as `grey`).
 */
export function rampHue(ramp: ColorRamp): number | null {
  let x = 0;
  let y = 0;
  for (const swatch of Object.values(ramp)) {
    const { c, h } = parseToOklch(swatch.hex);
    if (c < ACHROMATIC_EPSILON) continue;
    // Weight by chroma so the confident mid-steps outvote the near-grey ends.
    const rad = (h * Math.PI) / 180;
    x += c * Math.cos(rad);
    y += c * Math.sin(rad);
  }
  if (x === 0 && y === 0) return null;
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return deg < 0 ? deg + 360 : deg;
}

/**
 * Tint a neutral ramp toward the hue of `input`, preserving the base ramp's
 * per-step lightness exactly.
 *
 * An achromatic `input` or a `strength` of 0 returns the base ramp unchanged —
 * there is no hue to rotate toward.
 *
 * @param input - Hex string, `oklch(...)` string, or a hue in degrees.
 */
export function generateNeutralRamp(
  input: string | number,
  opts: NeutralRampOptions = {},
): ColorRamp {
  const base = opts.baseRamp ?? getCoreFamily("grey");
  const strength = opts.strength ?? DEFAULT_NEUTRAL_TINT;

  let hue: number;
  if (typeof input === "number") {
    hue = ((input % 360) + 360) % 360;
  } else {
    const parsed = parseToOklch(input);
    if (parsed.c < ACHROMATIC_EPSILON) return base;
    hue = parsed.h;
  }

  if (strength <= 0) return base;

  const ramp: ColorRamp = {};
  for (const [step, swatch] of Object.entries(base)) {
    // Read L back off the base so this composes with any base ramp, not just grey.
    const { l: targetL } = parseToOklch(swatch.hex);
    const targetC = strength * (NEUTRAL_CHROMA_ENVELOPE[step] ?? 1);
    const { l, c } = fitToGamut(targetL, targetC, hue);
    ramp[step] = { hex: oklchToHex(l, c, hue), oklch: oklchToString(l, c, hue) };
  }
  return ramp;
}

/**
 * A named neutral family, re-derived so that every preset shares one lightness
 * curve and differs only in hue.
 *
 * The authored families supply the hue; chroma comes from `strength`. `grey` is
 * achromatic and is returned as authored.
 */
export function getNeutralRamp(name: string, strength: number = DEFAULT_NEUTRAL_TINT): ColorRamp {
  const grey = getCoreFamily("grey");
  if (name === "grey") return grey;

  const authored = coreColors[name];
  if (!authored) return grey;

  const hue = rampHue(authored);
  if (hue === null) return grey;

  return generateNeutralRamp(hue, { baseRamp: grey, strength });
}
