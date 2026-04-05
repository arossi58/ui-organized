/**
 * Semantic color mapping for the live preview.
 *
 * Given the current brand ramp and neutral ramp, writes ALL color-related CSS
 * custom properties as directly-resolved hex values onto the preview container.
 *
 * We do NOT rely on var() chains (e.g. setting --brand-1200 and hoping that
 * --color-interactive-primary-default: var(--brand-1200) re-resolves). Instead
 * every semantic token is written with its final hex value. This is explicit,
 * predictable, and works regardless of CSS cascade subtleties.
 */

import { LINE_HEIGHT_MULTIPLIERS, type ColorRamp } from "@ds/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CSSVarMap = Record<string, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function step(ramp: ColorRamp, s: string): string {
  return ramp[s]?.hex ?? "#000000";
}

/**
 * Parse the OKLCH lightness component from an oklch() string.
 * e.g. "oklch(0.191 0.012 250)" → 0.191
 */
function parseLightness(oklch: string): number {
  const m = oklch.match(/oklch\(\s*([0-9.]+)/);
  return m ? parseFloat(m[1]) : 0;
}

/**
 * Find the ramp step whose lightness is closest to targetL.
 * Used to produce perceptually consistent semantic token mappings across
 * ramps that span different absolute lightness ranges (e.g. Shark vs Dove).
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

/**
 * Return the hex value of the ramp step closest to the given lightness target.
 */
function atL(ramp: ColorRamp, targetL: number): string {
  return step(ramp, findStepByLightness(ramp, targetL));
}

// ─── Main mapping function ────────────────────────────────────────────────────

/**
 * Compute all color CSS custom properties with resolved hex values.
 * Covers brand primitives, brand-dependent semantic tokens, and
 * neutral-dependent semantic tokens.
 */
export function computeColorVars(
  brandRamp: ColorRamp,
  neutralRamp: ColorRamp,
  brandShade: string,
  brandHex: string,
): CSSVarMap {
  const vars: CSSVarMap = {};

  // ── Brand primitive ramp ─────────────────────────────────────────────────────
  const ALL_STEPS = ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"];
  for (const s of ALL_STEPS) {
    vars[`--brand-${s}`] = step(brandRamp, s);
  }

  // ── Brand-dependent semantic tokens ──────────────────────────────────────────
  // When brandShade is "input" the user's exact picked hex is used as the
  // primary default. Hover/active are still derived from the nearest ramp step.
  let primaryHex: string;
  let anchorIndex: number;

  if (brandShade === "input") {
    primaryHex = brandHex;
    // Find the nearest ramp step by luminance to anchor hover/active offsets
    anchorIndex = ALL_STEPS.indexOf(findStepByLightness(brandRamp, parseLightness(
      // Approximate oklch lightness from relative luminance
      `oklch(${Math.sqrt(0.2126 * Math.pow(parseInt(brandHex.slice(1,3),16)/255,2.2) + 0.7152 * Math.pow(parseInt(brandHex.slice(3,5),16)/255,2.2) + 0.0722 * Math.pow(parseInt(brandHex.slice(5,7),16)/255,2.2)).toFixed(3)} 0 0)`
    )));
    if (anchorIndex < 0) anchorIndex = 11; // fallback to 1200
  } else {
    primaryHex = step(brandRamp, brandShade);
    anchorIndex = ALL_STEPS.indexOf(brandShade);
    if (anchorIndex < 0) anchorIndex = 11;
  }

  const hoverShade  = ALL_STEPS[Math.min(anchorIndex + 2, ALL_STEPS.length - 1)];
  const activeShade = ALL_STEPS[Math.min(anchorIndex + 4, ALL_STEPS.length - 1)];

  vars["--color-interactive-primary-default"]  = primaryHex;
  vars["--color-interactive-primary-hover"]    = step(brandRamp, hoverShade);
  vars["--color-interactive-primary-active"]   = step(brandRamp, activeShade);
  vars["--color-interactive-primary-selected"] = primaryHex;

  vars["--color-interactive-tertiary-default"]  = step(brandRamp, "900");
  vars["--color-interactive-tertiary-hover"]    = step(brandRamp, "700");
  vars["--color-interactive-tertiary-active"]   = step(brandRamp, "600");
  vars["--color-interactive-tertiary-selected"] = step(brandRamp, "1000");

  // ── Neutral-dependent semantic tokens ────────────────────────────────────────
  // All neutral mappings use lightness-offset lookups rather than hardcoded
  // step numbers. Offsets were calibrated against Shark (the canonical dark
  // neutral) so the visual relationships stay consistent when switching presets.
  //
  // Shark step reference lightness values used to derive offsets:
  //   1600→0.044  1500→0.082  1400→0.108  1300→0.136  1200→0.163
  //   1100→0.191  900→0.252   700→0.359
  //
  // Each offset is: targetStep.L − baseL(1600).L for Shark.
  const baseL = parseLightness(neutralRamp["1600"]?.oklch ?? "oklch(0.044 0 0)");

  // Surfaces — step up in lightness from the darkest available stop
  vars["--color-surface-base"]     = step(neutralRamp, "1600");          // always darkest stop
  vars["--color-surface-subtle"]   = atL(neutralRamp, baseL + 0.038);    // +0.038 → Shark 1500
  vars["--color-surface-medium"]   = atL(neutralRamp, baseL + 0.064);    // +0.064 → Shark 1400
  vars["--color-surface-emphasis"] = atL(neutralRamp, baseL + 0.092);    // +0.092 → Shark 1300
  vars["--color-surface-strong"]   = atL(neutralRamp, baseL + 0.119);    // +0.119 → Shark 1200

  // Secondary interactive
  vars["--color-interactive-secondary-default"]  = atL(neutralRamp, baseL + 0.147); // → Shark 1100
  vars["--color-interactive-secondary-hover"]    = atL(neutralRamp, baseL + 0.208); // → Shark 900
  vars["--color-interactive-secondary-active"]   = atL(neutralRamp, baseL + 0.315); // → Shark 700
  vars["--color-interactive-secondary-selected"] = atL(neutralRamp, baseL + 0.208); // → Shark 900

  // UI interactive (form controls, toggles)
  vars["--color-interactive-ui-default"]  = atL(neutralRamp, baseL + 0.092); // → Shark 1300
  vars["--color-interactive-ui-hover"]    = atL(neutralRamp, baseL + 0.147); // → Shark 1100
  vars["--color-interactive-ui-active"]   = atL(neutralRamp, baseL + 0.119); // → Shark 1200
  vars["--color-interactive-ui-selected"] = atL(neutralRamp, baseL + 0.119); // → Shark 1200

  return vars;
}

/**
 * Compute typography CSS custom properties.
 */
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

  // Heading weights
  vars["--type-weight-heading-regular"]  = String(headingWeights.default  ?? 400);
  vars["--type-weight-heading-medium"]   = String(headingWeights.emphasis ?? 500);
  vars["--type-weight-heading-semibold"] = String(headingWeights.strong   ?? 600);
  vars["--type-weight-heading-bold"]     = String(headingWeights.heavy    ?? 700);

  // Body weights
  vars["--type-weight-body-regular"]  = String(bodyWeights.default  ?? 400);
  vars["--type-weight-body-medium"]   = String(bodyWeights.emphasis ?? 500);
  vars["--type-weight-body-semibold"] = String(bodyWeights.strong   ?? 600);
  vars["--type-weight-body-bold"]     = String(bodyWeights.heavy    ?? 700);

  // Font sizes + line heights
  // Components reference --type-leading-{step} — emit that name so they respond
  // to the scale factor. PreviewTypography uses the same vars.
  for (const [stepName, px] of Object.entries(typeScaleSteps)) {
    vars[`--type-size-${stepName}`] = `${px}px`;
    const baseMultiplier = LINE_HEIGHT_MULTIPLIERS[stepName] ?? 1.5;
    const lh = Math.round(px * baseMultiplier * lineHeightScale * 100) / 100;
    vars[`--type-leading-${stepName}`] = `${lh}px`;
  }

  return vars;
}

/**
 * Compute spacing CSS custom properties from a base unit.
 */
export function computeSpacingVars(spacingScale: Record<string, number>): CSSVarMap {
  const vars: CSSVarMap = {};
  for (const [step, px] of Object.entries(spacingScale)) {
    vars[`--spacing-${step}`] = `${px}px`;
  }
  return vars;
}

/**
 * Compute border-radius CSS custom properties.
 */
export function computeRadiusVars(borderRadius: Record<string, number>): CSSVarMap {
  const vars: CSSVarMap = {};
  for (const [key, px] of Object.entries(borderRadius)) {
    const val = px >= 9999 ? "9999px" : `${px}px`;
    vars[`--border-radius-${key}`] = val;
  }
  return vars;
}

/**
 * Merge all preview CSS custom properties into one flat object.
 */
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
}): CSSVarMap {
  return {
    ...computeColorVars(params.brandRamp, params.neutralRamp, params.brandShade, params.brandHex),
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
  };
}
