/**
 * Type scale calculation utilities.
 *
 * The system defines a fixed set of semantic step names matching the actual
 * token library: display-xlarge down to caption.
 * Sizes are given for Desktop and Mobile breakpoints.
 *
 * The canonical Desktop sizes are:
 *   display-xlarge: 64px
 *   display-large:  48px
 *   display-medium: 40px
 *   heading-large:  32px
 *   heading-medium: 24px
 *   heading-small:  20px
 *   body-large:     16px
 *   body-medium:    14px
 *   body-small:     12px
 *   caption:        10px
 */

// ─── Fixed step definitions ───────────────────────────────────────────────────

/**
 * Semantic step names and their canonical Desktop pixel values.
 * These are system opinions from the type token library.
 */
export const TYPE_SCALE_STEPS_DESKTOP: Record<string, number> = {
  "display-xlarge": 64,
  "display-large":  48,
  "display-medium": 40,
  "heading-large":  32,
  "heading-medium": 24,
  "heading-small":  20,
  "body-large":     16,
  "body-medium":    14,
  "body-small":     12,
  "caption":        10,
};

/**
 * Canonical Mobile pixel values per step.
 * Same as Desktop in the current library (sizes match).
 */
export const TYPE_SCALE_STEPS_MOBILE: Record<string, number> = {
  "display-xlarge": 64,
  "display-large":  48,
  "display-medium": 40,
  "heading-large":  32,
  "heading-medium": 24,
  "heading-small":  20,
  "body-large":     16,
  "body-medium":    14,
  "body-small":     12,
  "caption":        10,
};

/** Canonical step names (ordered large → small) */
export const TYPE_SCALE_STEP_NAMES = Object.keys(TYPE_SCALE_STEPS_DESKTOP);

export type TypeScaleStepName = keyof typeof TYPE_SCALE_STEPS_DESKTOP;

// ─── Rounding ─────────────────────────────────────────────────────────────────

/**
 * Round a raw px value to a practical display pixel.
 * - Values < 16: round to nearest integer.
 * - Values >= 16: round to nearest even integer (aligns to 4px grid).
 */
export function roundTypeSize(raw: number): number {
  if (raw < 16) {
    return Math.round(raw);
  }
  return Math.round(raw / 2) * 2;
}

// ─── Scale generation ─────────────────────────────────────────────────────────

/**
 * Calculate a custom type scale from a base size and ratio, mapped to the
 * system's fixed semantic step names.
 *
 * Steps are ordered from largest (display-xlarge) to smallest (caption).
 * The "body-large" step is anchored to the provided base size.
 *
 * @param base  - Base font size in pixels (anchors body-large, e.g. 16).
 * @param ratio - Modular scale ratio (e.g. 1.25 for "Major Third").
 * @returns Record of step name → rounded pixel value.
 */
export function calculateTypeScale(base: number, ratio: number): Record<string, number> {
  // Exponents relative to body-large (index 6 in the ordered list, 0-based)
  const stepExponents: Record<string, number> = {
    "display-xlarge":  5,
    "display-large":   4,
    "display-medium":  3.5,
    "heading-large":   3,
    "heading-medium":  2,
    "heading-small":   1.5,
    "body-large":      0,
    "body-medium":    -0.5,
    "body-small":     -1,
    "caption":        -1.5,
  };

  const result: Record<string, number> = {};
  for (const [step, exponent] of Object.entries(stepExponents)) {
    const raw = base * Math.pow(ratio, exponent);
    result[step] = roundTypeSize(raw);
  }
  return result;
}

/**
 * Return the canonical fixed type scale (Desktop sizes).
 * Use this when you want the system's default sizes rather than a calculated scale.
 */
export function getCanonicalTypeScale(): Record<string, number> {
  return { ...TYPE_SCALE_STEPS_DESKTOP };
}

// ─── Line-height generation ───────────────────────────────────────────────────

/**
 * System-calculated line heights (unitless multipliers) per step.
 * Larger text gets tighter leading; smaller text gets looser leading.
 */
export const LINE_HEIGHT_MULTIPLIERS: Record<string, number> = {
  "display-xlarge":  1.1,
  "display-large":   1.15,
  "display-medium":  1.2,
  "heading-large":   1.25,
  "heading-medium":  1.3,
  "heading-small":   1.35,
  "body-large":      1.5,
  "body-medium":     1.5,
  "body-small":      1.55,
  "caption":         1.6,
};

/**
 * Calculate line-height values in pixels for each type scale step.
 * Returns rounded integer pixel values.
 */
export function calculateLineHeights(
  scalePx: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [step, sizePx] of Object.entries(scalePx)) {
    const multiplier = LINE_HEIGHT_MULTIPLIERS[step] ?? 1.5;
    result[step] = Math.round(sizePx * multiplier);
  }
  return result;
}
