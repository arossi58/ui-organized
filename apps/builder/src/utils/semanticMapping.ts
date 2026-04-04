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

// ─── Main mapping function ────────────────────────────────────────────────────

/**
 * Compute all color CSS custom properties with resolved hex values.
 * Covers brand primitives, brand-dependent semantic tokens, and
 * neutral-dependent semantic tokens.
 */
export function computeColorVars(
  brandRamp: ColorRamp,
  neutralRamp: ColorRamp,
): CSSVarMap {
  const vars: CSSVarMap = {};

  // ── Brand primitive ramp ─────────────────────────────────────────────────────
  for (const s of ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"]) {
    vars[`--brand-${s}`] = step(brandRamp, s);
  }

  // ── Brand-dependent semantic tokens (resolved directly — no var() chain) ─────
  vars["--color-interactive-primary-default"]  = step(brandRamp, "1200");
  vars["--color-interactive-primary-hover"]    = step(brandRamp, "1400");
  vars["--color-interactive-primary-active"]   = step(brandRamp, "1600");
  vars["--color-interactive-primary-selected"] = step(brandRamp, "1200");

  vars["--color-interactive-tertiary-default"]  = step(brandRamp, "900");
  vars["--color-interactive-tertiary-hover"]    = step(brandRamp, "700");
  vars["--color-interactive-tertiary-active"]   = step(brandRamp, "600");
  vars["--color-interactive-tertiary-selected"] = step(brandRamp, "1000");

  // ── Neutral-dependent semantic tokens ────────────────────────────────────────
  // Surfaces
  vars["--color-surface-base"]     = step(neutralRamp, "1600");
  vars["--color-surface-subtle"]   = step(neutralRamp, "1500");
  vars["--color-surface-medium"]   = step(neutralRamp, "1400");
  vars["--color-surface-emphasis"] = step(neutralRamp, "1300");
  vars["--color-surface-strong"]   = step(neutralRamp, "1200");

  // Secondary interactive
  vars["--color-interactive-secondary-default"]  = step(neutralRamp, "1100");
  vars["--color-interactive-secondary-hover"]    = step(neutralRamp, "900");
  vars["--color-interactive-secondary-active"]   = step(neutralRamp, "700");
  vars["--color-interactive-secondary-selected"] = step(neutralRamp, "900");

  // UI interactive (form controls, toggles)
  vars["--color-interactive-ui-default"]  = step(neutralRamp, "1300");
  vars["--color-interactive-ui-hover"]    = step(neutralRamp, "1100");
  vars["--color-interactive-ui-active"]   = step(neutralRamp, "1200");
  vars["--color-interactive-ui-selected"] = step(neutralRamp, "1200");

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
    ...computeColorVars(params.brandRamp, params.neutralRamp),
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
