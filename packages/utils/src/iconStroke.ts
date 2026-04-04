/**
 * Icon stroke weight adjustment algorithm.
 *
 * Adjusts the stroke width of outline/stroke-style icons based on their
 * rendered size so that all icons appear optically weighted the same across
 * sizes. At the reference size (24px) no adjustment is made.
 *
 * The adjustment uses a logarithmic curve: larger icons get a thinner stroke,
 * smaller icons get a slightly thicker stroke, preserving the visual weight
 * ratio between stroke and icon area.
 *
 * Only applied to stroke-based icon styles (outline). Solid/filled icons
 * ignore this setting entirely.
 */

export const ICON_REFERENCE_SIZE = 24;
export const ICON_DEFAULT_STROKE = 2;

/**
 * Calculate the optically corrected stroke width for a given icon size.
 *
 * @param size - The rendered icon size in pixels.
 * @param baseStroke - The library's native stroke width at reference size.
 *   Defaults to 2, which is Lucide's and Tabler's native stroke width.
 * @returns The adjusted stroke width, clamped to [1, 3] and rounded to
 *   the nearest quarter (0.25) for crisp rendering.
 */
export function adjustStrokeWidth(size: number, baseStroke = ICON_DEFAULT_STROKE): number {
  if (size <= 0) return baseStroke;
  if (size === ICON_REFERENCE_SIZE) return baseStroke;

  // Logarithmic correction: maintains optical weight ratio across sizes
  const factor = Math.log(ICON_REFERENCE_SIZE) / Math.log(size);
  const adjusted = baseStroke * factor;

  // Round to nearest 0.25 for clean sub-pixel rendering
  const rounded = Math.round(adjusted * 4) / 4;

  // Clamp to a practical range
  return Math.min(3, Math.max(1, rounded));
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
