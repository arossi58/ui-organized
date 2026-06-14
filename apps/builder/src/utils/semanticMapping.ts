/**
 * Preview CSS custom properties for the builder.
 *
 * Color tokens are resolved through @ds/utils `resolveSemanticColors`, which is
 * the SINGLE source of truth — the same reference-based semantic map the shipped
 * library CSS is built from. We substitute the chosen brand and neutral families
 * and write every `--color-*` token as a final resolved hex (no var() chains),
 * so the preview is explicit and independent of CSS cascade order.
 *
 * Typography, spacing, radius, and component-token aliases are computed locally
 * (they are theme-independent and don't vary by light/dark mode).
 */

import {
  LINE_HEIGHT_MULTIPLIERS,
  resolveSemanticColors,
  type ColorRamp,
} from "@ds/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CSSVarMap = Record<string, string>;

// ─── Color vars ───────────────────────────────────────────────────────────────

/**
 * Resolve all semantic color custom properties for the chosen brand/neutral
 * families and mode. `brandShade` re-anchors the primary interactive color.
 */
export function computeColorVars(
  brandRamp: ColorRamp,
  neutralRamp: ColorRamp,
  brandShade: string,
  mode: "light" | "dark",
): CSSVarMap {
  return resolveSemanticColors(mode, { brandRamp, neutralRamp, brandShade });
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
 * These match the component-tokens definitions and what component CSS files
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
