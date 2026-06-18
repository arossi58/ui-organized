/**
 * Accessible primary-shade logic for the brand ramp — the single source of truth
 * shared by the color store (auto-selecting a shade when the brand changes) and
 * the Color panel's shade picker (which only renders these shades).
 *
 * A usable primary colour must read clearly with the design system's white
 * button text (#fcfcfc) — ≥4.5:1 — and not be so dark it's effectively black.
 */

import { CORE_STEPS, type ColorRamp } from "@ui-organized/utils";

/** White (#fcfcfc) is the primary text/icon colour on brand buttons in the DS. */
export const PRIMARY_TEXT_HEX = "#fcfcfc";

/**
 * As a shade darkens its contrast with white climbs toward 21, so we cap it —
 * shades above this ratio are near-black and excluded. 12 keeps a healthy band
 * (3–7 shades per family) and never drops the curated default 1400.
 */
export const PRIMARY_MAX_CONTRAST = 12;

// ─── WCAG contrast ──────────────────────────────────────────────────────────

function hexToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * hexToLinear(r) + 0.7152 * hexToLinear(g) + 0.0722 * hexToLinear(b);
}

export function wcagContrast(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function contrastLevel(ratio: number): "AAA" | "AA" | "fail" {
  if (ratio >= 7)   return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fail";
}

// ─── Accessible primary shades ──────────────────────────────────────────────

/** True when a shade reads clearly with white button text and isn't near-black. */
export function isAccessiblePrimary(hex: string | undefined): boolean {
  if (!hex) return false;
  const contrast = wcagContrast(hex, PRIMARY_TEXT_HEX);
  return contrast >= 4.5 && contrast <= PRIMARY_MAX_CONTRAST;
}

/** The brand-ramp steps that are valid primary colours, in ramp order. */
export function getAccessibleShades(ramp: ColorRamp): string[] {
  return CORE_STEPS.filter((s) => isAccessiblePrimary(ramp[s]?.hex));
}

/**
 * Choose an accessible primary shade for `ramp`: keep `preferred` if it's still
 * accessible, otherwise snap to the nearest accessible shade by ramp position
 * (ties resolve to the darker / higher-contrast side). Falls back to `preferred`
 * only when the ramp has no accessible shade at all (not expected for real hues).
 */
export function pickAccessibleShade(ramp: ColorRamp, preferred: string): string {
  const valid = getAccessibleShades(ramp);
  if (valid.length === 0) return preferred;
  if (valid.includes(preferred)) return preferred;

  const target = CORE_STEPS.indexOf(preferred);
  let best = valid[0];
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
