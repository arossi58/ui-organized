/**
 * Theme config → DTCG token transform.
 *
 * Accepts a validated ThemeConfig and expands it into token objects
 * that the CSS build pipeline can process:
 *
 *   1. primitiveTokens  — brand, neutral, black, white, functional color ramps
 *   2. radiusTokens     — named radius scale (radius-01 through radius-full)
 *   3. spacingTokens    — full spacing scale from base unit
 *   4. typeTokens       — typography: fonts, sizes, weights, line-heights
 *   5. modeOverrides    — per-mode semantic color assignments
 *
 * All token values follow DTCG spec: { $value, $type }.
 * Dimension values use "px" suffix strings as required by DTCG.
 */

import type { ThemeConfig } from "@ui-organized/schema";
import {
  generateSpacingScale,
  calculateLineHeights,
  resolveWeights,
  type WeightRole,
} from "@ui-organized/utils";

// ─── DTCG token node ─────────────────────────────────────────────────────────

type TokenValue = string | number;

interface DtcgToken {
  $value: TokenValue;
  $type: string;
}

type TokenTree = {
  [key: string]: DtcgToken | TokenTree;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function px(value: number): string {
  return `${value}px`;
}

function colorToken(hex: string): DtcgToken {
  return { $value: hex, $type: "color" };
}

function dimensionToken(value: number): DtcgToken {
  return { $value: px(value), $type: "dimension" };
}

function fontFamilyToken(family: string): DtcgToken {
  return { $value: family, $type: "fontFamily" };
}

function fontWeightToken(weight: number): DtcgToken {
  return { $value: weight, $type: "fontWeight" };
}

// ─── Color ramp → token tree ─────────────────────────────────────────────────

function rampToTokens(ramp: Record<string, { hex: string; oklch: string }>): TokenTree {
  const result: TokenTree = {};
  for (const [step, swatch] of Object.entries(ramp)) {
    result[step] = colorToken(swatch.hex);
  }
  return result;
}

// ─── Transform ────────────────────────────────────────────────────────────────

export interface TransformResult {
  /** Primitive color tokens */
  primitiveTokens: TokenTree;
  /** Border radius scale tokens (radius-01 through radius-full) */
  radiusTokens: TokenTree;
  /** Spacing scale tokens */
  spacingTokens: TokenTree;
  /** Typography tokens */
  typeTokens: TokenTree;
  /**
   * Mode-specific semantic color overrides.
   * Keys are mode names ("dark", "light", etc.).
   * Values are flat maps of semantic token path → resolved hex.
   */
  modeOverrides: Record<string, Record<string, string>>;
}

/**
 * Transform a validated ThemeConfig into DTCG token structures.
 */
export function transformConfig(config: ThemeConfig): TransformResult {
  const { color, typography, borderRadius, spacing } = config;

  // ── Primitive color tokens ──────────────────────────────────────────────
  const primitiveTokens: TokenTree = {
    brand:   rampToTokens(color.resolvedPrimitives.brand),
    neutral: rampToTokens(color.resolvedPrimitives.neutral),
    black:   rampToTokens(color.resolvedPrimitives.black),
    white:   rampToTokens(color.resolvedPrimitives.white),
    // Functional palettes — named by their color family
    lima:        rampToTokens(color.resolvedPrimitives.functional.lima),
    cerulean:    rampToTokens(color.resolvedPrimitives.functional.cerulean),
    caribbean:   rampToTokens(color.resolvedPrimitives.functional.caribbean),
    candlelight: rampToTokens(color.resolvedPrimitives.functional.candlelight),
    cerise:      rampToTokens(color.resolvedPrimitives.functional.cerise),
    crimson:     rampToTokens(color.resolvedPrimitives.functional.crimson),
  };

  // ── Radius tokens ────────────────────────────────────────────────────────
  const radiusEntries: TokenTree = {};
  for (const [key, value] of Object.entries(borderRadius)) {
    radiusEntries[key] = dimensionToken(value as number);
  }
  const radiusTokens: TokenTree = { "border-radius": radiusEntries };

  // ── Spacing tokens ───────────────────────────────────────────────────────
  const spacingScale = generateSpacingScale(spacing.baseUnit);
  const spacingEntries: TokenTree = {};
  for (const [step, value] of Object.entries(spacingScale)) {
    spacingEntries[step] = dimensionToken(value);
  }
  const spacingTokens: TokenTree = { spacing: spacingEntries };

  // ── Typography tokens ────────────────────────────────────────────────────
  const { headingFont, bodyFont, scale } = typography;

  const headingWeights = resolveWeights(headingFont.weights as Record<string, number>);
  const bodyWeights = resolveWeights(bodyFont.weights as Record<string, number>);
  const lineHeights = calculateLineHeights(scale.steps);

  const sizeEntries: TokenTree = {};
  for (const [step, value] of Object.entries(scale.steps)) {
    sizeEntries[step] = dimensionToken(value);
  }

  const weightHeadingEntries: TokenTree = {};
  const weightBodyEntries: TokenTree = {};
  for (const [role, value] of Object.entries(headingWeights) as [WeightRole, number][]) {
    weightHeadingEntries[role] = fontWeightToken(value);
  }
  for (const [role, value] of Object.entries(bodyWeights) as [WeightRole, number][]) {
    weightBodyEntries[role] = fontWeightToken(value);
  }

  const leadingEntries: TokenTree = {};
  for (const [step, value] of Object.entries(lineHeights)) {
    leadingEntries[step] = dimensionToken(value);
  }

  const typeTokens: TokenTree = {
    type: {
      font: {
        heading: fontFamilyToken(headingFont.family),
        body:    fontFamilyToken(bodyFont.family),
      },
      size: sizeEntries,
      weight: {
        heading: weightHeadingEntries,
        body:    weightBodyEntries,
      },
      leading: leadingEntries,
    },
  };

  // ── Mode overrides ────────────────────────────────────────────────────────
  const modeOverrides: Record<string, Record<string, string>> = {};

  for (const [modeName, semanticMap] of Object.entries(color.modes)) {
    const resolved: Record<string, string> = {};
    for (const [semanticKey, primitiveRef] of Object.entries(semanticMap)) {
      if (primitiveRef.startsWith("css:")) {
        // Raw CSS value — pass through without primitive resolution
        resolved[semanticKey] = primitiveRef.slice(4);
      } else {
        const hex = resolvePrimitiveRef(primitiveRef, color.resolvedPrimitives);
        if (hex) resolved[semanticKey] = hex;
      }
    }
    modeOverrides[modeName] = resolved;
  }

  return { primitiveTokens, radiusTokens, spacingTokens, typeTokens, modeOverrides };
}

// ─── Primitive reference resolution ─────────────────────────────────────────

type ResolvedPrims = ThemeConfig["color"]["resolvedPrimitives"];

/**
 * Resolve a primitive reference string to a hex value.
 * Supported formats:
 *   "brand.1200"        → brand ramp step 1200
 *   "neutral.1600"      → neutral ramp step 1600
 *   "black.1100"        → black ramp step 1100
 *   "white.100"         → white ramp step 100
 *   "crimson.1300"      → functional.crimson step 1300
 */
function resolvePrimitiveRef(ref: string, primitives: ResolvedPrims): string | null {
  const dotIdx = ref.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const palette = ref.slice(0, dotIdx);
  const step = ref.slice(dotIdx + 1);

  // Direct top-level ramps
  if (palette === "brand")   return primitives.brand[step]?.hex ?? null;
  if (palette === "neutral") return primitives.neutral[step]?.hex ?? null;
  if (palette === "black")   return primitives.black[step]?.hex ?? null;
  if (palette === "white")   return primitives.white[step]?.hex ?? null;

  // Functional ramps
  const funcKey = palette as keyof ResolvedPrims["functional"];
  if (funcKey in primitives.functional) {
    return primitives.functional[funcKey][step]?.hex ?? null;
  }

  return null;
}
