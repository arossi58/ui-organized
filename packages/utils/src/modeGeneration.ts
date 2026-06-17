/**
 * Semantic mode generation.
 *
 * Given resolved primitive ramps (brand, neutral, black, white, functional),
 * generates semantic-to-primitive mappings for light and dark modes.
 *
 * These mappings become the `modes` object in the theme config.
 * Keys use dot-notation matching the DTCG token paths, which the build
 * pipeline converts to CSS custom property names:
 *   "color-surface.base"           → --color-surface-base
 *   "color-interactive.primary.default" → --color-interactive-primary-default
 *
 * Values are primitive references in "palette.step" format (e.g. "neutral.1600")
 * or "css:<value>" for raw CSS values (e.g. OKLCH composites for elevation).
 *
 * Design rules:
 *   Dark mode:  surfaces are dark (neutral 1600→1200), text is light (white ramp)
 *   Light mode: surfaces are light (neutral 100→500),  text is dark (black ramp)
 *   Interactive primary: anchored to brandShade (default "1200"), ±2/±4 for hover/active
 *   Status colors:  fixed functional palette steps — darker steps for dark mode,
 *                   lighter steps for light mode, same hues in both
 *   Elevation:  OKLCH relative syntax — neutral step 400 (dark) or 1400 (light)
 *               at 8% and 16% opacity; passed through as raw CSS via "css:" prefix
 */

// ─── Types ────────────────────────────────────────────────────────────────────

type ColorSwatch = { hex: string; oklch: string };
type Ramp = Record<string, ColorSwatch>;

export interface ResolvedPrimitives {
  brand: Ramp;
  neutral: Ramp;
  black: Ramp;
  white: Ramp;
  functional: {
    lima: Ramp;
    cerulean: Ramp;
    caribbean: Ramp;
    candlelight: Ramp;
    cerise: Ramp;
    crimson: Ramp;
  };
}

export type SemanticMode = Record<string, string>;

export interface GeneratedModes {
  light: SemanticMode;
  dark: SemanticMode;
}

// ─── Step offset helper ───────────────────────────────────────────────────────

const ALL_STEPS = [
  "100", "200", "300", "400", "500", "600", "700", "800",
  "900", "1000", "1100", "1200", "1300", "1400", "1500", "1600",
];

function offsetStep(shade: string, offset: number): string {
  const idx = ALL_STEPS.indexOf(shade);
  if (idx < 0) return shade;
  return ALL_STEPS[Math.min(Math.max(idx + offset, 0), ALL_STEPS.length - 1)] ?? shade;
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * Generate light and dark semantic color mappings.
 *
 * @param primitives - Resolved primitive ramps from the theme config
 * @param brandShade - Step used for interactive primary default (e.g. "1200")
 */
export function generateModes(
  primitives: ResolvedPrimitives,
  brandShade = "1200",
): GeneratedModes {
  const brandHover  = offsetStep(brandShade, +2);
  const brandActive = offsetStep(brandShade, +4);

  const dark: SemanticMode = {
    // ── Surfaces ──────────────────────────────────────────────────────────
    "color-surface.base":     "black.1600",
    "color-surface.subtle":   "black.1300",
    "color-surface.medium":   "neutral.1600",
    "color-surface.emphasis": "neutral.1500",
    "color-surface.strong":   "neutral.1400",

    // ── Text ──────────────────────────────────────────────────────────────
    "color-text.primary":     "white.100",
    "color-text.secondary":   "white.800",
    "color-text.tertiary":    "white.1100",
    "color-text.placeholder": "white.1100",
    "color-text.inverse":     "black.1600",
    "color-text.interactive": "white.100",

    // ── Borders ───────────────────────────────────────────────────────────
    "color-border.subtle":     "neutral.1500",
    "color-border.medium":     "neutral.1400",
    "color-border.emphasis":   "neutral.1300",
    "color-border.strong":     "neutral.1200",
    "color-border.data-entry": "neutral.1300",

    // ── Icons ─────────────────────────────────────────────────────────────
    "color-icon.primary":   "white.100",
    "color-icon.secondary": "white.800",
    "color-icon.tertiary":  "white.1100",

    // ── Interactive — primary (brand) ─────────────────────────────────────
    "color-interactive.primary.default":  `brand.${brandShade}`,
    "color-interactive.primary.hover":    `brand.${brandHover}`,
    "color-interactive.primary.active":   `brand.${brandActive}`,
    "color-interactive.primary.selected": `brand.${brandShade}`,

    // ── Interactive — secondary (neutral) ─────────────────────────────────
    "color-interactive.secondary.default":  "neutral.1400",
    "color-interactive.secondary.hover":    "neutral.1300",
    "color-interactive.secondary.active":   "neutral.700",
    "color-interactive.secondary.selected": "neutral.900",

    // ── Interactive — tertiary (brand accent) ─────────────────────────────
    "color-interactive.tertiary.default":  "brand.900",
    "color-interactive.tertiary.hover":    "brand.700",
    "color-interactive.tertiary.active":   "brand.600",
    "color-interactive.tertiary.selected": "brand.1000",

    // ── Interactive — ghost (transparent background, black hover) ─────────
    // ghost.default is rgba(0,0,0,0) — omitted (raw CSS, falls back to semantic default)
    "color-interactive.ghost.hover":  "black.800",
    "color-interactive.ghost.active": "black.1000",

    // ── Interactive — destructive (crimson) ───────────────────────────────
    "color-interactive.destructive.default":       "crimson.1000",
    "color-interactive.destructive.default-ghost": "crimson.800",
    "color-interactive.destructive.hover":         "crimson.1200",
    "color-interactive.destructive.hover-ghost":   "crimson.600",
    "color-interactive.destructive.active":        "crimson.1300",
    "color-interactive.destructive.active-ghost":  "crimson.400",

    // ── Interactive — shared ──────────────────────────────────────────────
    "color-interactive.contents":      "white.100",
    "color-interactive.focus":         "white.100",
    "color-interactive.focus-inverse": "black.1600",

    // ── Interactive — UI controls (form inputs, toggles) ──────────────────
    "color-interactive.ui.default":  "neutral.1600",
    "color-interactive.ui.hover":    "neutral.1500",
    "color-interactive.ui.active":   "neutral.1400",
    "color-interactive.ui.selected": "neutral.1400",

    // ── Interactive — inactive / disabled ─────────────────────────────────
    "color-interactive.inactive.01": "black.600",
    "color-interactive.inactive.02": "black.400",
    "color-interactive.inactive.03": "black.200",

    // ── Status — success (lima) ───────────────────────────────────────────
    "color-status.success":         "lima.700",
    "color-status.success-bg":      "lima.1100",
    "color-status.success-content": "lima.300",

    // ── Status — info (cerulean) ──────────────────────────────────────────
    "color-status.info":         "cerulean.800",
    "color-status.info-bg":      "cerulean.1100",
    "color-status.info-content": "cerulean.300",

    // ── Status — info-secondary (caribbean) ──────────────────────────────
    "color-status.info-secondary":         "caribbean.700",
    "color-status.info-secondary-bg":      "caribbean.1100",
    "color-status.info-secondary-content": "caribbean.300",

    // ── Status — caution (candlelight) ────────────────────────────────────
    "color-status.caution":         "candlelight.600",
    "color-status.caution-bg":      "candlelight.1100",
    "color-status.caution-content": "candlelight.300",

    // ── Status — warning (cerise) ─────────────────────────────────────────
    "color-status.warning":         "cerise.800",
    "color-status.warning-bg":      "cerise.1100",
    "color-status.warning-content": "cerise.300",

    // ── Status — error (crimson) ──────────────────────────────────────────
    "color-status.error":         "crimson.800",
    "color-status.error-message": "crimson.600",
    "color-status.error-bg":      "crimson.1100",
    "color-status.error-content": "crimson.300",

    // ── Elevation (OKLCH relative syntax — raw CSS via "css:" prefix) ─────
    // Dark mode: neutral step 400 (a lighter shade) brightens layers above the base
    "color-elevation.subtle": "css:oklch(from var(--neutral-400) l c h / 0.08)",
    "color-elevation.medium": "css:oklch(from var(--neutral-400) l c h / 0.16)",
  };

  const light: SemanticMode = {
    // ── Surfaces ──────────────────────────────────────────────────────────
    "color-surface.base":     "neutral.100",
    "color-surface.subtle":   "neutral.200",
    "color-surface.medium":   "neutral.300",
    "color-surface.emphasis": "neutral.400",
    "color-surface.strong":   "neutral.500",

    // ── Text ──────────────────────────────────────────────────────────────
    "color-text.primary":     "black.1600",
    "color-text.secondary":   "black.900",
    "color-text.tertiary":    "black.600",
    "color-text.placeholder": "black.600",
    "color-text.inverse":     "white.100",
    "color-text.interactive": "black.1600",

    // ── Borders ───────────────────────────────────────────────────────────
    "color-border.subtle":     "black.200",
    "color-border.medium":     "black.300",
    "color-border.emphasis":   "black.400",
    "color-border.strong":     "black.500",
    "color-border.data-entry": "black.600",

    // ── Icons ─────────────────────────────────────────────────────────────
    "color-icon.primary":   "black.1600",
    "color-icon.secondary": "black.900",
    "color-icon.tertiary":  "black.600",

    // ── Interactive — primary (brand) ─────────────────────────────────────
    "color-interactive.primary.default":  `brand.${brandShade}`,
    "color-interactive.primary.hover":    `brand.${brandHover}`,
    "color-interactive.primary.active":   `brand.${brandActive}`,
    "color-interactive.primary.selected": `brand.${brandShade}`,

    // ── Interactive — secondary (neutral, light end) ───────────────────────
    "color-interactive.secondary.default":  "neutral.100",
    "color-interactive.secondary.hover":    "neutral.300",
    "color-interactive.secondary.active":   "neutral.400",
    "color-interactive.secondary.selected": "neutral.300",

    // ── Interactive — tertiary (brand accent) ─────────────────────────────
    "color-interactive.tertiary.default":  "brand.900",
    "color-interactive.tertiary.hover":    "brand.700",
    "color-interactive.tertiary.active":   "brand.600",
    "color-interactive.tertiary.selected": "brand.1000",

    // ── Interactive — ghost (transparent background, black hover) ─────────
    "color-interactive.ghost.hover":  "black.200",
    "color-interactive.ghost.active": "black.400",

    // ── Interactive — destructive (crimson, lighter for light surfaces) ────
    "color-interactive.destructive.default":       "crimson.900",
    "color-interactive.destructive.default-ghost": "crimson.800",
    "color-interactive.destructive.hover":         "crimson.1100",
    "color-interactive.destructive.hover-ghost":   "crimson.600",
    "color-interactive.destructive.active":        "crimson.1200",
    "color-interactive.destructive.active-ghost":  "crimson.400",

    // ── Interactive — shared ──────────────────────────────────────────────
    "color-interactive.contents":      "white.100",
    "color-interactive.focus":         "black.1600",
    "color-interactive.focus-inverse": "white.100",

    // ── Interactive — UI controls ─────────────────────────────────────────
    "color-interactive.ui.default":  "neutral.100",
    "color-interactive.ui.hover":    "neutral.200",
    "color-interactive.ui.active":   "neutral.300",
    "color-interactive.ui.selected": "neutral.200",

    // ── Interactive — inactive / disabled ─────────────────────────────────
    "color-interactive.inactive.01": "black.300",
    "color-interactive.inactive.02": "black.500",
    "color-interactive.inactive.03": "black.700",

    // ── Status — lighter steps for light surfaces ─────────────────────────
    "color-status.success":         "lima.600",
    "color-status.success-bg":      "lima.100",
    "color-status.success-content": "lima.900",

    "color-status.info":         "cerulean.700",
    "color-status.info-bg":      "cerulean.100",
    "color-status.info-content": "cerulean.900",

    "color-status.info-secondary":         "caribbean.600",
    "color-status.info-secondary-bg":      "caribbean.100",
    "color-status.info-secondary-content": "caribbean.900",

    "color-status.caution":         "candlelight.500",
    "color-status.caution-bg":      "candlelight.100",
    "color-status.caution-content": "candlelight.900",

    "color-status.warning":         "cerise.700",
    "color-status.warning-bg":      "cerise.100",
    "color-status.warning-content": "cerise.900",

    "color-status.error":         "crimson.700",
    "color-status.error-message": "crimson.600",
    "color-status.error-bg":      "crimson.100",
    "color-status.error-content": "crimson.900",

    // ── Elevation (OKLCH relative syntax — raw CSS via "css:" prefix) ─────
    // Light mode: neutral step 1400 (a darker shade) darkens layers above the base
    "color-elevation.subtle": "css:oklch(from var(--neutral-1400) l c h / 0.08)",
    "color-elevation.medium": "css:oklch(from var(--neutral-1400) l c h / 0.16)",
  };

  // Unused parameter — kept to ensure the function validates the ramp structure
  void primitives;

  return { dark, light };
}
