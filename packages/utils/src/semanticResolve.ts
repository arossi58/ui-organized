/**
 * Resolver for the canonical semantic color map.
 *
 * Kept separate from semanticColorMap.ts (which is GENERATED from the token
 * JSON) so regenerating the map never clobbers this logic.
 *
 * Resolves each "family.step" reference against the chosen brand and neutral
 * families ("brand.*" → brand family, "grey.*" → neutral family, any other
 * family → its fixed core ramp), passing raw CSS values through unchanged.
 * Used for both the builder's live preview and theme CSS export.
 */

import { semanticColorMap } from "./semanticColorMap.js";
import { getCoreFamily, CORE_STEPS } from "./coreColors.js";
import type { ColorRamp } from "./colorGeneration.js";

const FAMILY_REF = /^([a-z]+)\.(\d+)$/;

function offsetStep(step: string, delta: number): string {
  const i = CORE_STEPS.indexOf(step);
  if (i < 0) return step;
  return CORE_STEPS[Math.min(Math.max(i + delta, 0), CORE_STEPS.length - 1)] ?? step;
}

export interface ResolveOptions {
  /** Resolved brand ramp — a chosen core family or a generated custom ramp. */
  brandRamp: ColorRamp;
  /** Resolved neutral ramp — the chosen tinted-grey family (replaces "grey.*"). */
  neutralRamp: ColorRamp;
  /**
   * Optional override for the primary interactive shade. When set, the four
   * `primary` tokens are re-derived from this step (hover +2 darker, active −1
   * lighter) instead of the authored defaults.
   */
  brandShade?: string;
}

/** Resolve one "family.step" reference (or pass a raw value through). */
function resolveRef(ref: string, opts: ResolveOptions): string {
  const m = FAMILY_REF.exec(ref);
  if (!m) return ref; // raw CSS value (#hex, rgba(), etc.)
  const [, family, step] = m;
  const ramp =
    family === "brand" ? opts.brandRamp :
    family === "grey"  ? opts.neutralRamp :
    getCoreFamily(family!);
  return ramp[step!]?.hex ?? ref;
}

/**
 * Resolve the canonical semantic map for a mode into a flat
 * `{ "--color-…": "#hex" }` object, substituting the chosen brand and neutral
 * families. Used for both the live preview (inline styles) and theme export.
 */
export function resolveSemanticColors(
  mode: "light" | "dark",
  opts: ResolveOptions,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [cssVar, ref] of Object.entries(semanticColorMap[mode])) {
    out[cssVar] = resolveRef(ref, opts);
  }

  // Optional primary-shade override (the builder's primary-color tool).
  if (opts.brandShade) {
    const s = opts.brandShade;
    out["--color-interactive-primary-default"]  = opts.brandRamp[s]?.hex ?? out["--color-interactive-primary-default"]!;
    out["--color-interactive-primary-selected"] = out["--color-interactive-primary-default"]!;
    out["--color-interactive-primary-hover"]    = opts.brandRamp[offsetStep(s, +2)]?.hex ?? out["--color-interactive-primary-hover"]!;
    out["--color-interactive-primary-active"]   = opts.brandRamp[offsetStep(s, -1)]?.hex ?? out["--color-interactive-primary-active"]!;
  }

  // Bare brand token — the brand primary color (tracks the chosen primary shade).
  out["--brand"] = out["--color-interactive-primary-default"]!;

  return out;
}
