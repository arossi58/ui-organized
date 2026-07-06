import type { DtcgType } from "@ui-organized/schema";

/**
 * Core resolver types. Pure data — no DOM, no framework, no I/O.
 */

// ─── Resolved values ─────────────────────────────────────────────────────────

/** Every resolved color carries both OKLCH and hex. */
export interface ResolvedColor {
  oklch: string;
  hex: string;
}

/** A resolved dimension/duration keeps its numeric value and unit separate. */
export interface ResolvedDimension {
  value: number;
  unit: string;
}

/** The raw resolved value of a token, shape depending on `$type`. */
export type ResolvedValue =
  | ResolvedColor
  | ResolvedDimension
  | number
  | string
  | string[]
  | boolean
  | { [key: string]: ResolvedValue }
  | ResolvedValue[];

// ─── Effective (merged) document ─────────────────────────────────────────────

/**
 * A single token after sets have been merged and group `$type` inheritance has
 * been applied. `$type` may still be absent for a pure alias whose type is
 * inherited from its referent at resolution time.
 */
export interface EffectiveToken {
  path: string;
  $type?: DtcgType;
  $value: unknown;
  $extensions?: Record<string, unknown>;
}

/** The flat, merged, mode-selected token map the resolver operates on. */
export interface EffectiveDocument {
  tokens: Map<string, EffectiveToken>;
}

// ─── Resolution results & typed misses ───────────────────────────────────────

export interface TokenResolution {
  path: string;
  $type: DtcgType;
  raw: ResolvedValue;
  /** The transitive reference chain this resolution depended on, for UI. */
  references: string[];
}

/**
 * A typed failure. Callers decide how to surface it; the resolver never
 * substitutes a fallback value silently.
 */
export type ResolveMiss =
  | { kind: "unknown-token"; path: string; referencedFrom?: string }
  | { kind: "cycle"; cycle: string[] }
  | { kind: "type-mismatch"; path: string; expected: DtcgType; got: DtcgType }
  | { kind: "bad-expression"; path: string; expr: string; reason: string };

/** The discriminator values a {@link ResolveMiss} can take. */
export type ResolveMissKind = ResolveMiss["kind"];

/** Result of resolving a whole document for one mode. */
export interface ResolveResult {
  mode: string;
  /** Successfully resolved tokens, keyed by path. */
  tokens: Map<string, TokenResolution>;
  /** Every typed miss encountered, in document order. */
  misses: ResolveMiss[];
}

/** Options accepted by {@link resolve} and {@link resolveToken}. */
export interface ResolveOptions {
  /** Mode label carried into the result; the effective document is already
   *  mode-selected by the merge step. Defaults to `"default"`. */
  mode?: string;
}

// ─── Dependency graph ────────────────────────────────────────────────────────

export interface DependencyNode {
  path: string;
  /** Paths this token directly references (its out-edges). */
  references: string[];
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
}

/**
 * Narrows any `X | ResolveMiss` union to the miss case. Only a {@link ResolveMiss}
 * carries a `kind` discriminant, so the check is sound for the resolver's
 * internal result unions as well as the public `TokenResolution | ResolveMiss`.
 */
export function isResolveMiss(value: object): value is ResolveMiss {
  return "kind" in value;
}
