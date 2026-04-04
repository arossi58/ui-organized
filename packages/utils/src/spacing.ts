/**
 * Spacing scale.
 *
 * The system uses a fixed named spacing scale — space-005 through space-32.
 * Names follow a decimal pattern where the number approximates multiples of 4px:
 *   space-005 = 2px (0.5 × 4)
 *   space-01  = 4px (1 × 4)
 *   space-02  = 8px (2 × 4)
 *   ...etc.
 *
 * The user provides a base unit, but the scale names and their multipliers
 * are fixed system opinions. This allows components to reference
 * e.g. `--spacing-space-04` (16px at 4px base) consistently.
 */

// ─── Fixed named scale ────────────────────────────────────────────────────────

/**
 * Fixed spacing scale: step name → pixel value at the canonical 4px base unit.
 * These are the authoritative values from the design token library.
 */
export const SPACING_SCALE: Record<string, number> = {
  "space-005": 2,
  "space-01":  4,
  "space-015": 6,
  "space-02":  8,
  "space-025": 10,
  "space-03":  12,
  "space-04":  16,
  "space-05":  20,
  "space-06":  24,
  "space-07":  28,
  "space-08":  32,
  "space-09":  36,
  "space-10":  40,
  "space-11":  44,
  "space-12":  48,
  "space-16":  64,
  "space-32":  128,
};

/**
 * Multipliers relative to a 4px base unit for each step.
 * Allows scaling the entire system if the base unit changes.
 */
export const SPACING_MULTIPLIERS: Record<string, number> = {
  "space-005": 0.5,
  "space-01":  1,
  "space-015": 1.5,
  "space-02":  2,
  "space-025": 2.5,
  "space-03":  3,
  "space-04":  4,
  "space-05":  5,
  "space-06":  6,
  "space-07":  7,
  "space-08":  8,
  "space-09":  9,
  "space-10":  10,
  "space-11":  11,
  "space-12":  12,
  "space-16":  16,
  "space-32":  32,
};

// ─── Generation ───────────────────────────────────────────────────────────────

/**
 * Generate the spacing scale from a base unit.
 * At the canonical 4px base unit the output matches SPACING_SCALE exactly.
 *
 * @param baseUnit - Base unit in pixels (default 4). Must be positive.
 * @returns Record of step name → pixel value.
 */
export function generateSpacingScale(baseUnit: number = 4): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [step, multiplier] of Object.entries(SPACING_MULTIPLIERS)) {
    result[step] = baseUnit * multiplier;
  }
  return result;
}
