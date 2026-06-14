/**
 * The brand colours the site theme menu offers.
 *
 * Every option is a real family from the design system's core palette
 * (`@ds/utils`) — no ad-hoc hexes — and every option is accessibility-checked:
 * the shade used as the primary interactive colour must clear WCAG AA (4.5:1)
 * against the white (`#fcfcfc`) text the design system places on brand buttons.
 */

import { getCoreFamily, CORE_STEPS, type ColorRamp } from "@ds/utils";

/** White is the text/icon colour on brand (primary) buttons in the DS. */
const PRIMARY_TEXT_HEX = "#fcfcfc";
/** The design system's default primary step. */
const DEFAULT_PRIMARY_SHADE = "1400";

// ─── WCAG contrast (sRGB relative luminance) ────────────────────────────────

function srgbToLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG contrast ratio between two hex colours (1–21). */
export function wcagContrast(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * The lightest brand step at or below the default (1400) that still clears
 * 4.5:1 against white button text. Walking darker from 1400 guarantees the
 * chosen primary fill is accessible for every offered colour.
 */
function accessiblePrimaryShade(ramp: ColorRamp): string {
  const start = Math.max(CORE_STEPS.indexOf(DEFAULT_PRIMARY_SHADE), 0);
  for (let i = start; i < CORE_STEPS.length; i++) {
    const step = CORE_STEPS[i]!;
    const hex = ramp[step]?.hex;
    if (hex && wcagContrast(hex, PRIMARY_TEXT_HEX) >= 4.5) return step;
  }
  return CORE_STEPS[CORE_STEPS.length - 1]!;
}

// ─── Brand options ──────────────────────────────────────────────────────────

export interface BrandOption {
  /** Core family name — the `@ds/utils` palette key. */
  name: string;
  /** Human-facing label shown in the menu. */
  label: string;
  /** Brand-ramp step used as the primary interactive colour (accessible). */
  shade: string;
  /** Resolved hex of the primary colour — the swatch and the site accent. */
  hex: string;
}

/**
 * A spread across the hue wheel from the core palette. `mars` is first so it
 * stays the default (matches the design system's shipped brand).
 */
const CURATED_FAMILIES = [
  "mars",
  "pumpkin",
  "crimson",
  "cerise",
  "eggplant",
  "purple",
  "lapis",
  "cerulean",
  "scooter",
  "caribbean",
  "emerald",
  "midas",
] as const;

const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const BRAND_OPTIONS: BrandOption[] = CURATED_FAMILIES.map((name) => {
  const ramp = getCoreFamily(name);
  const shade = accessiblePrimaryShade(ramp);
  return { name, label: titleCase(name), shade, hex: ramp[shade]?.hex ?? "#000000" };
});

export const DEFAULT_BRAND = CURATED_FAMILIES[0];

/** Resolve a stored/selected brand name to a known option (falls back to default). */
export function getBrandOption(name: string | undefined): BrandOption {
  return BRAND_OPTIONS.find((o) => o.name === name) ?? BRAND_OPTIONS[0]!;
}
