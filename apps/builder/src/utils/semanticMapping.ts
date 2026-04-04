/**
 * Semantic color mapping for the live preview.
 *
 * Given the current brand ramp and neutral ramp, computes all CSS custom
 * property values that need to be written to the preview container. This
 * directly overrides the values from @ds/tokens/variables.css so that
 * components inside the preview reflect the user's choices.
 *
 * Strategy:
 * - Write brand primitive ramp (`--brand-100` … `--brand-1600`) so component
 *   tokens that use `var(--brand-XXX)` resolve to the new brand color.
 * - Write neutral-dependent semantic tokens as resolved hex values, since the
 *   base CSS uses `var(--shark-XXX)` and we can't rename that reference live.
 * - Static functional / text / border tokens are inherited from `:root` and do
 *   not need to be overridden.
 */

import type { ColorRamp } from "@ds/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CSSVarMap = Record<string, string>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function step(ramp: ColorRamp, s: string): string {
  return ramp[s]?.hex ?? "#000000";
}

// ─── Main mapping function ────────────────────────────────────────────────────

/**
 * Compute preview CSS custom properties from the current brand + neutral ramps.
 *
 * Only properties that vary with user input are included. Static values
 * (functional status colors, white/black ramps, overlays) come from `:root`.
 */
export function computeColorVars(
  brandRamp: ColorRamp,
  neutralRamp: ColorRamp,
): CSSVarMap {
  const vars: CSSVarMap = {};

  // ── Brand primitives (overrides :root --brand-XXX) ──────────────────────────
  for (const s of ["100","200","300","400","500","600","700","800","900","1000","1100","1200","1300","1400","1500","1600"]) {
    vars[`--brand-${s}`] = step(brandRamp, s);
  }

  // ── Neutral-dependent semantic tokens ────────────────────────────────────────
  // Surface — maps to neutral dark steps (surface = dark UI background in dark mode)
  vars["--color-surface-base"]     = step(neutralRamp, "1600");
  vars["--color-surface-subtle"]   = step(neutralRamp, "1500");
  vars["--color-surface-medium"]   = step(neutralRamp, "1400");
  vars["--color-surface-emphasis"] = step(neutralRamp, "1300");
  vars["--color-surface-strong"]   = step(neutralRamp, "1200");

  // Secondary interactive — uses neutral mid-dark steps
  vars["--color-interactive-secondary-default"]  = step(neutralRamp, "1100");
  vars["--color-interactive-secondary-hover"]    = step(neutralRamp, "900");
  vars["--color-interactive-secondary-active"]   = step(neutralRamp, "700");
  vars["--color-interactive-secondary-selected"] = step(neutralRamp, "900");

  // UI interactive (form controls, toggles, etc.)
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

  // Font sizes
  for (const [stepName, px] of Object.entries(typeScaleSteps)) {
    vars[`--type-size-${stepName}`] = `${px}px`;
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
    ),
    ...computeSpacingVars(params.spacingScale),
    ...computeRadiusVars(params.borderRadius),
  };
}
