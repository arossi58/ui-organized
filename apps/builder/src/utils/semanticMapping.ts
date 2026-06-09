/**
 * Semantic color mapping for the live preview.
 *
 * Given the current brand ramp, neutral ramp, and preview mode, writes ALL
 * color-related CSS custom properties as directly-resolved values onto the
 * preview container.
 *
 * We do NOT rely on var() chains — every semantic token is written with its
 * final resolved value. This is explicit, predictable, and works regardless
 * of CSS cascade subtleties.
 *
 * Static tokens that never change (ghost default transparency, overlay curtain,
 * status colors, destructive crimson) are already provided by variables.css.
 * This module only overrides the mode- and theme-dependent values.
 */

import { LINE_HEIGHT_MULTIPLIERS, type ColorRamp } from "@ds/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CSSVarMap = Record<string, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function step(ramp: ColorRamp, s: string): string {
  return ramp[s]?.hex ?? "#000000";
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Parse the OKLCH lightness component from an oklch() string.
 */
function parseLightness(oklch: string): number {
  const m = oklch.match(/oklch\(\s*([0-9.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

/**
 * Find the ramp step whose lightness is closest to targetL.
 */
function findStepByLightness(ramp: ColorRamp, targetL: number): string {
  let closest = "1600";
  let minDiff = Infinity;
  for (const [key, swatch] of Object.entries(ramp)) {
    const diff = Math.abs(parseLightness(swatch.oklch) - targetL);
    if (diff < minDiff) {
      minDiff = diff;
      closest = key;
    }
  }
  return closest;
}

const ALL_STEPS = ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"];

// ─── Color vars ───────────────────────────────────────────────────────────────

/**
 * Compute all color CSS custom properties with resolved values.
 * Covers every token that changes based on brand, neutral, or mode selection.
 */
export function computeColorVars(
  brandRamp: ColorRamp,
  neutralRamp: ColorRamp,
  brandShade: string,
  brandHex: string,
  mode: "light" | "dark",
): CSSVarMap {
  const vars: CSSVarMap = {};

  const isDark = mode === "dark";

  // ── Brand primitive ramp ─────────────────────────────────────────────────
  for (const s of ALL_STEPS) {
    vars[`--brand-${s}`] = step(brandRamp, s);
  }

  // ── Brand shade anchoring for hover/active ────────────────────────────────
  let anchorIndex: number;

  if (brandShade === "input") {
    anchorIndex = ALL_STEPS.indexOf(findStepByLightness(brandRamp, parseLightness(
      `oklch(${Math.sqrt(
        0.2126 * Math.pow(parseInt(brandHex.slice(1, 3), 16) / 255, 2.2) +
        0.7152 * Math.pow(parseInt(brandHex.slice(3, 5), 16) / 255, 2.2) +
        0.0722 * Math.pow(parseInt(brandHex.slice(5, 7), 16) / 255, 2.2)
      ).toFixed(3)} 0 0)`
    )));
    if (anchorIndex < 0) anchorIndex = 11;
  } else {
    anchorIndex = ALL_STEPS.indexOf(brandShade);
    if (anchorIndex < 0) anchorIndex = 11;
  }

  const primaryHex   = brandShade === "input" ? brandHex : step(brandRamp, brandShade);
  const hoverShade   = ALL_STEPS[Math.min(anchorIndex + 2, ALL_STEPS.length - 1)] ?? brandShade;
  const activeShade  = ALL_STEPS[Math.min(anchorIndex + 4, ALL_STEPS.length - 1)] ?? brandShade;

  // ── Interactive — primary ─────────────────────────────────────────────────
  vars["--color-interactive-primary-default"]  = primaryHex;
  vars["--color-interactive-primary-hover"]    = step(brandRamp, hoverShade);
  vars["--color-interactive-primary-active"]   = step(brandRamp, activeShade);
  vars["--color-interactive-primary-selected"] = primaryHex;

  // ── Interactive — tertiary ────────────────────────────────────────────────
  vars["--color-interactive-tertiary-default"]  = step(brandRamp, "900");
  vars["--color-interactive-tertiary-hover"]    = step(brandRamp, "700");
  vars["--color-interactive-tertiary-active"]   = step(brandRamp, "600");
  vars["--color-interactive-tertiary-selected"] = step(brandRamp, "1000");

  // Neutral shorthand
  function n(s: string): string { return step(neutralRamp, s); }

  // ── Surfaces ──────────────────────────────────────────────────────────────
  if (isDark) {
    vars["--color-surface-base"]     = "var(--black-1600)";
    vars["--color-surface-subtle"]   = "var(--black-1300)";
    vars["--color-surface-medium"]   = n("1600");
    vars["--color-surface-emphasis"] = n("1500");
    vars["--color-surface-strong"]   = n("1400");
  } else {
    vars["--color-surface-base"]     = n("100");
    vars["--color-surface-subtle"]   = n("200");
    vars["--color-surface-medium"]   = n("300");
    vars["--color-surface-emphasis"] = n("400");
    vars["--color-surface-strong"]   = n("500");
  }

  // ── Interactive — secondary (neutral-dependent) ───────────────────────────
  if (isDark) {
    vars["--color-interactive-secondary-default"]  = n("1400");
    vars["--color-interactive-secondary-hover"]    = n("1300");
    vars["--color-interactive-secondary-active"]   = n("700");
    vars["--color-interactive-secondary-selected"] = n("900");
    vars["--color-interactive-ui-default"]         = n("1600");
    vars["--color-interactive-ui-hover"]           = n("1500");
    vars["--color-interactive-ui-active"]          = n("1400");
    vars["--color-interactive-ui-selected"]        = n("1400");
  } else {
    vars["--color-interactive-secondary-default"]  = n("100");
    vars["--color-interactive-secondary-hover"]    = n("300");
    vars["--color-interactive-secondary-active"]   = n("400");
    vars["--color-interactive-secondary-selected"] = n("300");
    vars["--color-interactive-ui-default"]         = n("100");
    vars["--color-interactive-ui-hover"]           = n("200");
    vars["--color-interactive-ui-active"]          = n("300");
    vars["--color-interactive-ui-selected"]        = n("200");
  }

  // ── Text ──────────────────────────────────────────────────────────────────
  // These reference the black/white ramps which are fixed (not from neutralRamp).
  // In dark mode: white ramp for readable text on dark surfaces.
  // In light mode: black ramp for readable text on light surfaces.
  // We use hex literals because the builder doesn't load white/black ramps
  // dynamically — these are fixed system ramps baked into variables.css.
  // For the builder preview we read the values from variables.css via CSS vars.
  // Using var() here is safe since variables.css is loaded before inline styles.
  if (isDark) {
    vars["--color-text-text-primary"]     = "var(--white-100)";
    vars["--color-text-text-secondary"]   = "var(--white-800)";
    vars["--color-text-text-tertiary"]    = "var(--white-1100)";
    vars["--color-text-text-placeholder"] = "var(--white-1100)";
    vars["--color-text-text-inverse"]     = "var(--black-1600)";
    vars["--color-text-text-interactive"] = "var(--white-100)";
    vars["--color-icon-icon-primary"]     = "var(--white-100)";
    vars["--color-icon-icon-secondary"]   = "var(--white-800)";
    vars["--color-icon-icon-tertiary"]    = "var(--white-1100)";
    vars["--color-interactive-focus"]         = "var(--white-100)";
    vars["--color-interactive-focus-inverse"] = "var(--black-1600)";
    vars["--color-interactive-ghost-hover"]   = "var(--black-800)";
    vars["--color-interactive-ghost-active"]  = "var(--black-1000)";
    vars["--color-interactive-inactive-inactive-01"] = "var(--black-600)";
    vars["--color-interactive-inactive-inactive-02"] = "var(--black-400)";
    vars["--color-interactive-inactive-inactive-03"] = "var(--black-200)";
  } else {
    vars["--color-text-text-primary"]     = "var(--black-1600)";
    vars["--color-text-text-secondary"]   = "var(--black-900)";
    vars["--color-text-text-tertiary"]    = "var(--black-600)";
    vars["--color-text-text-placeholder"] = "var(--black-600)";
    vars["--color-text-text-inverse"]     = "var(--white-100)";
    vars["--color-text-text-interactive"] = "var(--black-1600)";
    vars["--color-icon-icon-primary"]     = "var(--black-1600)";
    vars["--color-icon-icon-secondary"]   = "var(--black-900)";
    vars["--color-icon-icon-tertiary"]    = "var(--black-600)";
    vars["--color-interactive-focus"]         = "var(--black-1600)";
    vars["--color-interactive-focus-inverse"] = "var(--white-100)";
    vars["--color-interactive-ghost-hover"]   = "var(--black-200)";
    vars["--color-interactive-ghost-active"]  = "var(--black-400)";
    vars["--color-interactive-inactive-inactive-01"] = "var(--black-300)";
    vars["--color-interactive-inactive-inactive-02"] = "var(--black-500)";
    vars["--color-interactive-inactive-inactive-03"] = "var(--black-700)";
  }

  // ── Borders ───────────────────────────────────────────────────────────────
  if (isDark) {
    vars["--color-border-subtle"]     = n("1500");
    vars["--color-border-medium"]     = n("1400");
    vars["--color-border-emphasis"]   = n("1300");
    vars["--color-border-strong"]     = n("1200");
    vars["--color-border-data-entry"] = n("1300");
  } else {
    vars["--color-border-subtle"]     = "var(--black-200)";
    vars["--color-border-medium"]     = "var(--black-300)";
    vars["--color-border-emphasis"]   = "var(--black-400)";
    vars["--color-border-strong"]     = "var(--black-500)";
    vars["--color-border-data-entry"] = "var(--black-600)";
  }

  // ── Elevation (OKLCH composite using resolved neutral hex + rgba fallback) ─
  // The OKLCH relative color syntax requires the referenced CSS var to be
  // available at parse time; for the inline-style preview we compute rgba
  // directly since we have the hex values.
  const elevationStep = isDark ? "400" : "1400";
  const elevationHex  = n(elevationStep);
  vars["--color-elevation-subtle"] = hexToRgba(elevationHex, 0.08);
  vars["--color-elevation-medium"] = hexToRgba(elevationHex, 0.16);

  return vars;
}

// ─── Typography vars ──────────────────────────────────────────────────────────

export function computeTypographyVars(
  headingFamily: string,
  bodyFamily: string,
  headingWeights: Record<string, number>,
  bodyWeights: Record<string, number>,
  typeScaleSteps: Record<string, number>,
  lineHeightScale: number,
): CSSVarMap {
  const vars: CSSVarMap = {};

  vars["--type-font-heading"] = `'${headingFamily}', sans-serif`;
  vars["--type-font-body"]    = `'${bodyFamily}', sans-serif`;

  vars["--type-weight-heading-regular"]  = String(headingWeights.default  ?? 400);
  vars["--type-weight-heading-medium"]   = String(headingWeights.emphasis ?? 500);
  vars["--type-weight-heading-semibold"] = String(headingWeights.strong   ?? 600);
  vars["--type-weight-heading-bold"]     = String(headingWeights.heavy    ?? 700);

  vars["--type-weight-body-regular"]  = String(bodyWeights.default  ?? 400);
  vars["--type-weight-body-medium"]   = String(bodyWeights.emphasis ?? 500);
  vars["--type-weight-body-semibold"] = String(bodyWeights.strong   ?? 600);
  vars["--type-weight-body-bold"]     = String(bodyWeights.heavy    ?? 700);

  for (const [stepName, px] of Object.entries(typeScaleSteps)) {
    vars[`--type-size-${stepName}`] = `${px}px`;
    const baseMultiplier = LINE_HEIGHT_MULTIPLIERS[stepName] ?? 1.5;
    const lh = Math.round(px * baseMultiplier * lineHeightScale * 100) / 100;
    vars[`--type-leading-${stepName}`] = `${lh}px`;
  }

  return vars;
}

// ─── Spacing vars ─────────────────────────────────────────────────────────────

export function computeSpacingVars(spacingScale: Record<string, number>): CSSVarMap {
  const vars: CSSVarMap = {};
  for (const [step, px] of Object.entries(spacingScale)) {
    vars[`--spacing-${step}`] = `${px}px`;
  }
  return vars;
}

// ─── Radius vars ─────────────────────────────────────────────────────────────

export function computeRadiusVars(borderRadius: Record<string, number>): CSSVarMap {
  const vars: CSSVarMap = {};
  for (const [key, px] of Object.entries(borderRadius)) {
    const val = px >= 9999 ? "9999px" : `${px}px`;
    vars[`--border-radius-${key}`] = val;
  }
  return vars;
}

// ─── Component token aliases ──────────────────────────────────────────────────

/**
 * Compute component-level token aliases that reference spacing and radius values.
 * These match the component-tokens.ts definitions and what component CSS files
 * reference directly (e.g. var(--radius-interactive), var(--Button-Small-vertical)).
 */
export function computeComponentTokenVars(
  borderRadius: Record<string, number>,
  spacingScale: Record<string, number>,
): CSSVarMap {
  const vars: CSSVarMap = {};

  // Radius aliases
  const r = (key: string): string => {
    const px = borderRadius[key];
    return px !== undefined ? (px >= 9999 ? "9999px" : `${px}px`) : "0px";
  };
  vars["--radius-interactive"] = r("radius-04");
  vars["--radius-checkbox"]    = r("radius-02");
  vars["--radius-status"]      = "9999px";

  // Button spacing aliases (Desktop values)
  const sp = (key: string): string => {
    const px = spacingScale[key];
    return px !== undefined ? `${px}px` : "0px";
  };
  vars["--Button-Small-horizontal"]  = sp("space-02");
  vars["--Button-Small-vertical"]    = sp("space-005");
  vars["--Button-Medium-horizontal"] = sp("space-03");
  vars["--Button-Medium-vertical"]   = sp("space-01");
  vars["--Button-Large-horizontal"]  = sp("space-04");
  vars["--Button-Large-vertical"]    = sp("space-02");
  vars["--Button-Large-square"]      = sp("space-025");

  return vars;
}

// ─── Combined ─────────────────────────────────────────────────────────────────

export function computeAllPreviewVars(params: {
  brandRamp: ColorRamp;
  neutralRamp: ColorRamp;
  brandShade: string;
  brandHex: string;
  headingFamily: string;
  bodyFamily: string;
  headingWeights: Record<string, number>;
  bodyWeights: Record<string, number>;
  typeScaleSteps: Record<string, number>;
  lineHeightScale: number;
  spacingScale: Record<string, number>;
  borderRadius: Record<string, number>;
  mode: "light" | "dark";
}): CSSVarMap {
  return {
    ...computeColorVars(
      params.brandRamp,
      params.neutralRamp,
      params.brandShade,
      params.brandHex,
      params.mode,
    ),
    ...computeTypographyVars(
      params.headingFamily,
      params.bodyFamily,
      params.headingWeights,
      params.bodyWeights,
      params.typeScaleSteps,
      params.lineHeightScale,
    ),
    ...computeSpacingVars(params.spacingScale),
    ...computeRadiusVars(params.borderRadius),
    ...computeComponentTokenVars(params.borderRadius, params.spacingScale),
  };
}
