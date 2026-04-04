/**
 * Icon stroke weight adjustment algorithm.
 *
 * Adjusts the stroke width of outline/stroke-style icons based on their
 * rendered size so that all icons appear optically weighted the same across
 * sizes. At the reference size no adjustment is made.
 *
 * Formula: stroke = baseStroke × (size / referenceSize) ^ intensity
 *
 * This matches the scale used by icon-organized.com with the default
 * intensity of 0.50 (their "recommended" compensation level).
 * Example at baseStroke=2, referenceSize=24, intensity=0.50:
 *   12px → 1.41  |  16px → 1.63  |  20px → 1.83  |  24px → 2.00
 *   32px → 2.31  |  40px → 2.58  |  48px → 2.83  |  64px → 3.27
 *
 * Only applied to stroke-based icon styles (outline). Solid/filled icons
 * ignore this setting entirely.
 */

export const ICON_REFERENCE_SIZE = 24;
export const ICON_DEFAULT_STROKE = 2;
export const ICON_STROKE_INTENSITY = 0.5;

/**
 * Calculate the optically corrected stroke width for a given icon size.
 *
 * @param size          - The rendered icon size in pixels.
 * @param baseStroke    - Stroke width at the reference size. Defaults to 2.
 * @param referenceSize - The design/reference size. Defaults to 24px.
 * @param intensity     - Compensation intensity (0 = no adjustment, 1.5 = very aggressive).
 *   Defaults to 0.50, the recommended value from icon-organized.com.
 * @returns The adjusted stroke width, rounded to the nearest 0.25 for crisp rendering.
 */
export function adjustStrokeWidth(
  size: number,
  baseStroke = ICON_DEFAULT_STROKE,
  referenceSize = ICON_REFERENCE_SIZE,
  intensity = ICON_STROKE_INTENSITY,
): number {
  if (size <= 0) return baseStroke;
  // stroke = baseStroke × (size / referenceSize)^intensity
  const adjusted = baseStroke * Math.pow(size / referenceSize, intensity);
  // Round to nearest 0.25 for clean sub-pixel rendering
  return Math.round(adjusted * 4) / 4;
}

/**
 * Whether stroke adjustment should be applied for the given config.
 * Returns false for solid/filled styles regardless of the toggle.
 */
export function shouldAdjustStroke(
  strokeAdjustment: boolean,
  style: "outline" | "solid",
): boolean {
  return strokeAdjustment && style === "outline";
}
