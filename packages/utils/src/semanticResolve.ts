/**
 * Resolver for the canonical semantic color map.
 *
 * Kept separate from semanticColorMap.ts so the map stays a plain table that
 * mirrors the token JSON line for line (`semanticColorMap.test.ts` checks it).
 *
 * Resolves each "family.step" reference against the chosen brand and neutral
 * families ("brand.*" → brand family, "grey.*" → neutral family, any other
 * family → its fixed core ramp), passing raw CSS values through unchanged.
 * Used for both the builder's live preview and theme CSS export.
 */

import { semanticColorMap } from "./semanticColorMap.js";
import { getAuthoredFamily, CORE_STEPS } from "./coreColors.js";
import type { ColorRamp } from "./colorGeneration.js";
import { contrastRatio } from "./contrast.js";

const FAMILY_REF = /^([a-z]+)\.(\d+)$/;

/**
 * Translucent overlay tokens. In the shipped theme these are alpha colors
 * (e.g. `--color-interactive-ui-default` is `#fcfcfc05` in dark, `#02020205` in
 * light), but `semanticColorMap` records only the base color, as a
 * `family.step` reference or an opaque hex. Without the alpha, inputs,
 * ghost/secondary buttons, and UI control surfaces resolve to a solid fill
 * (white in dark, black in light) instead of a subtle overlay. We re-apply the
 * canonical alpha here; `semanticColorMap.test.ts` checks the result against
 * the JSON.
 *
 * The three `--color-surface-overlay-*` tokens carry their own alpha ramp
 * (overlay-primary/secondary/tertiary = 0.06/0.10/0.14); the map writes them as
 * a solid `grey.100`, so they're re-aliased to alpha here too. (They used to
 * mirror the interactive-ui ramp, but ui now steps 0.02/0.06/0.10 while the
 * overlays stay 0.06/0.10/0.14.)
 *
 * Alpha is mode-independent — only the base color (light vs dark) flips, and
 * that already comes from the map — so a single table covers both modes.
 */
const TOKEN_ALPHA: Record<string, number> = {
  "--color-interactive-ui-default": 0.02,
  "--color-interactive-ui-hover": 0.06,
  "--color-interactive-ui-active": 0.1,
  "--color-interactive-ui-selected": 0.14,
  "--color-interactive-secondary-default": 0.1,
  "--color-interactive-secondary-hover": 0.2,
  "--color-interactive-secondary-selected": 0.15,
  "--color-interactive-secondary-active": 0.15,
  "--color-interactive-ghost-default": 0,
  "--color-interactive-ghost-hover": 0.2,
  "--color-interactive-ghost-active": 0.15,
  "--color-surface-overlay-primary": 0.06,
  "--color-surface-overlay-secondary": 0.1,
  "--color-surface-overlay-tertiary": 0.14,
};

/** Apply an alpha to a `#rrggbb` hex, producing `rgba(...)`. Other forms pass through. */
function withAlpha(value: string, alpha: number): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(value);
  if (!m) return value;
  const hex = m[1]!;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
function resolveRef(ref: string, opts: ResolveOptions, cssVar: string): string {
  const m = FAMILY_REF.exec(ref);
  if (!m) return ref; // raw CSS value (#hex, rgba(), etc.)
  const [, family, step] = m;
  const ramp =
    family === "brand" ? opts.brandRamp :
    family === "grey"  ? opts.neutralRamp :
    getAuthoredFamily(family!);
  const hex = ramp[step!]?.hex;
  // Emitting the ref itself would write "grey.2400" into CSS as an invalid value.
  if (!hex) throw missingStep(ref, family!, ramp, cssVar);
  return hex;
}

function missingStep(ref: string, family: string, ramp: ColorRamp, cssVar: string): Error {
  const which = family === "brand" ? "brand ramp" : family === "grey" ? "neutral ramp" : `"${family}" ramp`;
  const steps = Object.keys(ramp);
  return new Error(
    `Semantic ref "${ref}" (${cssVar}) is not in the supplied ${which} ` +
      `(steps ${steps[0]}–${steps[steps.length - 1]}). Pass a full ${CORE_STEPS.length}-step ramp, ` +
      `e.g. getCoreFamily(name); getNeutralPreset() ramps are 16-step pack presets.`,
  );
}

// ─── Contrast-derived roles ────────────────────────────────────────────────────
//
// A fixed step can't hold contrast for every brand: the families diverge by
// tens of L* mid-ramp, so the step that passes depends on a paired token (the
// fill under a label, the surface under a link) the map can't see. These roles
// start at their mapped step and walk the brand ramp until they clear AA.
// Anything that already passes stays on its mapped step.

const AA_TEXT = 4.5;

const PRIMARY_FILLS = [
  "--color-interactive-primary-default",
  "--color-interactive-primary-hover",
  "--color-interactive-primary-active",
  "--color-interactive-primary-selected",
] as const;

/** The one tertiary state drawn as text: the outline button's resting label. */
const LINK_STATE = "--color-interactive-tertiary-default";

/**
 * The outline button's hover and press states. Button.css fills the button
 * with these and draws `--color-content-light` on top, so they are fills under
 * a light label, not link text.
 */
const TERTIARY_FILLS = [
  "--color-interactive-tertiary-hover",
  "--color-interactive-tertiary-active",
] as const;

/** Filled-button label candidates, preferred first. */
const LABEL_REFS = ["grey.100", "grey.2400"] as const;

/** The label the resolver puts on a primary fill, and how well it reads there. */
export interface PrimaryLabel {
  /** Neutral ref the label resolves to: near-white or near-black. */
  ref: (typeof LABEL_REFS)[number];
  /** Resolved label color. */
  hex: string;
  /** WCAG contrast of the label on the fill. */
  ratio: number;
}

/**
 * The filled-button label (`--color-interactive-contents`) the resolver chooses
 * for a primary fill: near-white when it clears 4.5:1 (preferred), else
 * near-black when that does, else whichever reads better. Exported so shade
 * pickers can judge a fill by the label it will actually get.
 */
export function pickPrimaryLabel(fillHex: string, neutralRamp: ColorRamp): PrimaryLabel {
  const scored = LABEL_REFS.map((ref) => {
    const hex = neutralRamp[FAMILY_REF.exec(ref)![2]!]?.hex;
    if (!hex) throw missingStep(ref, "grey", neutralRamp, "--color-interactive-contents");
    return { ref, hex, ratio: contrastRatio(hex, fillHex) };
  });
  return scored.find((c) => c.ratio >= AA_TEXT) ?? scored.reduce((a, b) => (b.ratio > a.ratio ? b : a));
}

function brandStep(ref: string | undefined): string | undefined {
  const m = ref ? FAMILY_REF.exec(ref) : null;
  return m && m[1] === "brand" ? m[2] : undefined;
}

/**
 * From `start`, walk the ramp one step at a time in `dir` (+1 darker, −1
 * lighter) and return the first step not in `avoid` whose worst ratio against
 * `beds` clears `target`. If the ramp runs out, return the best-scoring
 * candidate seen, so a hopeless ramp degrades rather than throws.
 */
function pickStep(
  ramp: ColorRamp,
  start: string,
  dir: 1 | -1,
  beds: string[],
  target: number,
  avoid: ReadonlySet<string> = new Set(),
): string {
  let best = start;
  let bestRatio = -1;
  for (let i = CORE_STEPS.indexOf(start); i >= 0 && i < CORE_STEPS.length; i += dir) {
    const step = CORE_STEPS[i]!;
    const hex = ramp[step]?.hex;
    if (!hex || avoid.has(step)) continue;
    const ratio = Math.min(...beds.map((b) => contrastRatio(hex, b)));
    if (ratio >= target) return step;
    if (ratio > bestRatio) [best, bestRatio] = [step, ratio];
  }
  return best;
}

/**
 * The map for a mode after the primary-shade override and the contrast-derived
 * roles are applied — still as "family.step" refs, so `resolveSemanticRefs`
 * can keep the primitive alias to whichever step was chosen.
 */
function effectiveRefs(mode: "light" | "dark", opts: ResolveOptions): Record<string, string> {
  const refs: Record<string, string> = { ...semanticColorMap[mode] };
  const hex = (cssVar: string): string => resolveRef(refs[cssVar]!, opts, cssVar);

  // Optional primary-shade override (the builder's primary-color tool).
  if (opts.brandShade) {
    const s = opts.brandShade;
    const set = (cssVar: string, step: string): void => {
      if (opts.brandRamp[step]) refs[cssVar] = `brand.${step}`;
    };
    set("--color-interactive-primary-default", s);
    set("--color-interactive-primary-selected", s);
    set("--color-interactive-primary-hover", offsetStep(s, +2));
    set("--color-interactive-primary-active", offsetStep(s, -1));
  }

  // Filled-button label: whichever of near-white / near-black reads on the
  // resting fill (white preferred), then any other fill state that fails with
  // that label walks away from it — darker under a light label, lighter under
  // a dark one — staying distinct from the resting step.
  const restStep = brandStep(refs["--color-interactive-primary-default"]);
  if (restStep) {
    const pick = pickPrimaryLabel(hex("--color-interactive-primary-default"), opts.neutralRamp);
    refs["--color-interactive-contents"] = pick.ref;

    const away: 1 | -1 = pick.ref === LABEL_REFS[0] ? 1 : -1;
    const used = new Set([restStep]);
    for (const cssVar of PRIMARY_FILLS.slice(1)) {
      const step = brandStep(refs[cssVar]);
      if (!step || contrastRatio(pick.hex, hex(cssVar)) >= AA_TEXT) {
        if (step) used.add(step);
        continue;
      }
      // Selected mirrors the resting fill, so it may share its step.
      const avoid = cssVar.endsWith("-selected") ? new Set<string>() : used;
      const next = pickStep(opts.brandRamp, step, away, [pick.hex], AA_TEXT, avoid);
      refs[cssVar] = `brand.${next}`;
      used.add(next);
    }
  }

  // Link text (the outline button's resting label and border) must read at
  // body size on both surfaces. Walk toward the page's opposite end: lighter
  // in dark mode, darker in light.
  const linkStep = brandStep(refs[LINK_STATE]);
  if (linkStep) {
    const beds = [hex("--color-surface-primary"), hex("--color-surface-secondary")];
    const toward: 1 | -1 = mode === "dark" ? -1 : 1;
    refs[LINK_STATE] = `brand.${pickStep(opts.brandRamp, linkStep, toward, beds, AA_TEXT)}`;
  }

  // Outline-button fills: on hover and press the button fills solid with
  // `--color-content-light` on top, so each fill walks away from that label
  // (darker, since it is near-white in both modes) until the label clears AA.
  // Each state also starts at least a step darker than the one before it, as
  // the map has them (dark 1100 → 1400 → 1500, light 1500 → 1600 → 1700), so
  // the button deepens on hover and again on press. Without that floor, a
  // brand whose resting outline had to walk far (lime in light mode) would
  // lighten on hover.
  //
  // These used to be walked as link text, against the surfaces, because
  // CONTRAST-AUDIT Task 3 lumped them in with the link. In dark mode that walk
  // pulls toward the page's light end, the opposite of what a light label
  // needs: utils 4.0.0 moved mars from a 7.29:1 hover to 3.45:1 and left every
  // dark brand failing, down to 1.15:1. No check paired these fills with their
  // label, so nothing noticed.
  const label = hex("--color-content-light");
  let prev = brandStep(refs[LINK_STATE]);
  for (const cssVar of TERTIARY_FILLS) {
    const step = brandStep(refs[cssVar]);
    if (!step) continue;
    const from =
      prev && CORE_STEPS.indexOf(step) <= CORE_STEPS.indexOf(prev) ? offsetStep(prev, +1) : step;
    prev = pickStep(opts.brandRamp, from, 1, [label], AA_TEXT);
    refs[cssVar] = `brand.${prev}`;
  }

  return refs;
}

/**
 * Resolve the canonical semantic map for a mode into a flat
 * `{ "--color-…": "#hex" }` object, substituting the chosen brand and neutral
 * families. Used for both the live preview (inline styles) and theme export.
 *
 * The filled-button label (`--color-interactive-contents`), the primary fill
 * states, the link color and the outline button's hover/press fills are chosen
 * by contrast against what they are paired with, so they hold WCAG AA for any
 * brand. Throws if a ref's step is missing from the supplied ramp.
 */
export function resolveSemanticColors(
  mode: "light" | "dark",
  opts: ResolveOptions,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [cssVar, ref] of Object.entries(effectiveRefs(mode, opts))) {
    out[cssVar] = resolveRef(ref, opts, cssVar);
  }

  // Bare brand token — the brand primary color (tracks the chosen primary shade).
  out["--brand"] = out["--color-interactive-primary-default"]!;

  // Re-apply the alpha the map leaves out for translucent overlay tokens.
  for (const [cssVar, alpha] of Object.entries(TOKEN_ALPHA)) {
    const v = out[cssVar];
    if (v) out[cssVar] = withAlpha(v, alpha);
  }

  return out;
}

/**
 * A resolved semantic token, keeping the link to its primitive where one exists.
 *
 * - `alias` — the token references a global/primitive step. `group` is the
 *   primitive group it points at (`"brand"` and `"neutral"` for the swappable
 *   families, otherwise the fixed core family name like `"crimson"`); `step` is
 *   the ramp step; `hex` is the fully-resolved value (matches
 *   `resolveSemanticColors`), used to materialise the primitive itself.
 * - `raw` — a literal CSS value with no primitive (mode-specific `#hex`/`rgba()`
 *   literals, plus the translucent overlay tokens whose alpha can't ride on an
 *   opaque primitive alias).
 */
export type SemanticRef =
  | { kind: "alias"; group: string; step: string; hex: string }
  | { kind: "raw"; value: string };

/** Map a raw token family to its primitive group (swappable roles vs fixed core). */
function familyToGroup(family: string): string {
  return family === "brand" ? "brand" : family === "grey" ? "neutral" : family;
}

/**
 * Resolve the canonical semantic map for a mode into reference-preserving
 * tokens. The same substitutions, brand-shade override and overlay-alpha rules
 * as `resolveSemanticColors` apply — so every `alias.hex` and `raw.value` here
 * is byte-identical to that function's output — but the primitive link is kept
 * (as an `alias`) wherever the source map expresses one. Used by the theme
 * export to emit a `primitive` layer plus aliasing semantic tokens (Figma
 * variable aliases / DTCG references).
 */
export function resolveSemanticRefs(
  mode: "light" | "dark",
  opts: ResolveOptions,
): Record<string, SemanticRef> {
  const out: Record<string, SemanticRef> = {};
  for (const [cssVar, ref] of Object.entries(effectiveRefs(mode, opts))) {
    const m = FAMILY_REF.exec(ref);
    if (!m) {
      out[cssVar] = { kind: "raw", value: ref }; // raw CSS literal (#hex / rgba())
      continue;
    }
    const [, family, step] = m;
    out[cssVar] = {
      kind: "alias",
      group: familyToGroup(family!),
      step: step!,
      hex: resolveRef(ref, opts, cssVar),
    };
  }

  // Bare brand token tracks the primary interactive color (same alias).
  const primary = out["--color-interactive-primary-default"];
  if (primary) out["--brand"] = primary;

  // Translucent overlays: alpha can't ride on an opaque primitive alias, so
  // emit the resolved color as a raw rgba() literal (matches resolveSemanticColors).
  for (const [cssVar, alpha] of Object.entries(TOKEN_ALPHA)) {
    const cur = out[cssVar];
    if (!cur) continue;
    const base = cur.kind === "alias" ? cur.hex : cur.value;
    out[cssVar] = { kind: "raw", value: withAlpha(base, alpha) };
  }

  return out;
}
