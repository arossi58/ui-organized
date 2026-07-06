import type { DtcgType } from "@ui-organized/schema";
import {
  type ColorValue,
  darken,
  lighten,
  mix,
  parseColor,
  parseColorModifier,
  toResolvedColor,
  withAlpha,
  type ColorModifierCall,
} from "./color.js";
import { evaluateExpression, looksLikeExpression } from "./math.js";
import { asPureReference, containsReference, parseReferences } from "./references.js";
import {
  isResolveMiss,
  type EffectiveDocument,
  type EffectiveToken,
  type ResolveMiss,
  type ResolveOptions,
  type ResolveResult,
  type ResolvedDimension,
  type ResolvedValue,
  type TokenResolution,
} from "./types.js";

/**
 * The deterministic resolution engine. Resolves an {@link EffectiveDocument}
 * (already merged + mode-selected) into raw values, returning either a
 * {@link TokenResolution} or a typed {@link ResolveMiss} for every token. No
 * `Date`, no `Math.random`, no I/O — same input, same output.
 */

interface Ctx {
  doc: EffectiveDocument;
  memo: Map<string, TokenResolution | ResolveMiss>;
  stack: string[];
}

const COMPOSITE_TYPES = new Set<DtcgType>([
  "typography",
  "shadow",
  "border",
  "transition",
  "gradient",
]);

/** Sub-field → expected `$type` for object composites. */
const COMPOSITE_FIELDS: Partial<Record<DtcgType, Record<string, DtcgType>>> = {
  typography: {
    fontFamily: "fontFamily",
    fontSize: "dimension",
    fontWeight: "fontWeight",
    lineHeight: "dimension",
    letterSpacing: "dimension",
  },
  shadow: {
    color: "color",
    offsetX: "dimension",
    offsetY: "dimension",
    blur: "dimension",
    spread: "dimension",
  },
  border: { color: "color", width: "dimension", style: "strokeStyle" },
  transition: { duration: "duration", delay: "duration", timingFunction: "cubicBezier" },
};

const FONT_WEIGHT_KEYWORDS: Record<string, number> = {
  thin: 100,
  hairline: 100,
  "extra-light": 200,
  "ultra-light": 200,
  light: 300,
  normal: 400,
  regular: 400,
  medium: 500,
  "semi-bold": 600,
  "demi-bold": 600,
  bold: 700,
  "extra-bold": 800,
  "ultra-bold": 800,
  black: 900,
  heavy: 900,
  "extra-black": 950,
  "ultra-black": 950,
};

// ─── Public API ──────────────────────────────────────────────────────────────

/** Resolves an entire effective document for one mode, in one memoized pass. */
export function resolve(doc: EffectiveDocument, opts?: ResolveOptions): ResolveResult {
  const ctx: Ctx = { doc, memo: new Map(), stack: [] };
  const tokens = new Map<string, TokenResolution>();
  const misses: ResolveMiss[] = [];
  const seenMiss = new Set<ResolveMiss>();

  for (const path of doc.tokens.keys()) {
    const result = resolvePath(ctx, path);
    if (isResolveMiss(result)) {
      if (!seenMiss.has(result)) {
        seenMiss.add(result);
        misses.push(result);
      }
    } else {
      tokens.set(path, result);
    }
  }

  return { mode: opts?.mode ?? "default", tokens, misses };
}

/**
 * Resolves a single token (and only its transitive dependencies) — the
 * incremental path the editor uses for live preview without re-resolving the
 * whole document.
 */
export function resolveToken(
  doc: EffectiveDocument,
  path: string,
  _opts?: ResolveOptions,
): TokenResolution | ResolveMiss {
  return resolvePath({ doc, memo: new Map(), stack: [] }, path);
}

// ─── Recursive resolution ────────────────────────────────────────────────────

function resolvePath(
  ctx: Ctx,
  path: string,
  referencedFrom?: string,
): TokenResolution | ResolveMiss {
  const cached = ctx.memo.get(path);
  if (cached) return cached;

  if (ctx.stack.includes(path)) {
    return { kind: "cycle", cycle: ctx.stack.slice(ctx.stack.indexOf(path)) };
  }

  const token = ctx.doc.tokens.get(path);
  if (!token) {
    const miss: ResolveMiss = referencedFrom
      ? { kind: "unknown-token", path, referencedFrom }
      : { kind: "unknown-token", path };
    ctx.memo.set(path, miss);
    return miss;
  }

  ctx.stack.push(path);
  const result = resolveValue(ctx, token, path);
  ctx.stack.pop();
  ctx.memo.set(path, result);
  return result;
}

function resolveValue(ctx: Ctx, token: EffectiveToken, path: string): TokenResolution | ResolveMiss {
  const value = token.$value;

  // Pure alias: adopt the referent's resolved value and type.
  const refPath = asPureReference(value);
  if (refPath) {
    const dep = resolvePath(ctx, refPath, path);
    if (isResolveMiss(dep)) return dep;
    if (token.$type && token.$type !== dep.$type) {
      return { kind: "type-mismatch", path, expected: token.$type, got: dep.$type };
    }
    return { path, $type: dep.$type, raw: dep.raw, references: dedupe([refPath, ...dep.references]) };
  }

  // Determine the effective type.
  const type = token.$type ?? inferType(value);
  if (!type) {
    return { kind: "bad-expression", path, expr: stringify(value), reason: "cannot determine $type" };
  }

  if (COMPOSITE_TYPES.has(type)) {
    const composite = resolveComposite(ctx, type, value, path);
    if (isResolveMiss(composite)) return composite;
    return { path, $type: type, raw: composite.raw, references: composite.references };
  }

  const resolved = resolveTypedValue(ctx, type, value, path);
  if (isResolveMiss(resolved)) return resolved;
  return { path, $type: type, raw: resolved.raw, references: resolved.references };
}

// ─── Per-type primitive resolution ───────────────────────────────────────────

interface RawWithRefs {
  raw: ResolvedValue;
  references: string[];
}

function resolveTypedValue(
  ctx: Ctx,
  expected: DtcgType,
  value: unknown,
  path: string,
): RawWithRefs | ResolveMiss {
  // A sub-field may itself be a pure alias to a primitive token.
  const refPath = asPureReference(value);
  if (refPath) {
    const dep = resolvePath(ctx, refPath, path);
    if (isResolveMiss(dep)) return dep;
    if (dep.$type !== expected) {
      return { kind: "type-mismatch", path, expected, got: dep.$type };
    }
    return { raw: dep.raw, references: dedupe([refPath, ...dep.references]) };
  }

  switch (expected) {
    case "color":
      return resolveColorValue(ctx, value, path);
    case "dimension":
    case "duration":
    case "number":
      return resolveNumericValue(ctx, expected, value, path);
    case "fontFamily":
      return resolveFontFamily(value, path);
    case "fontWeight":
      return resolveFontWeight(value, path);
    case "cubicBezier":
      return resolveCubicBezier(value, path);
    case "strokeStyle":
      return resolveStrokeStyle(value, path);
    default:
      return { raw: value as ResolvedValue, references: [] };
  }
}

function resolveColorValue(ctx: Ctx, value: unknown, path: string): RawWithRefs | ResolveMiss {
  const modifier = parseColorModifier(value);
  if (modifier) {
    const result = resolveColorModifier(ctx, modifier, path);
    if (isResolveMiss(result)) return result;
    return { raw: toResolvedColor(result.value), references: result.references };
  }
  const literal = parseColor(value);
  if (!literal) {
    return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid color value" };
  }
  return { raw: toResolvedColor(literal), references: [] };
}

function resolveNumericValue(
  ctx: Ctx,
  type: "dimension" | "duration" | "number",
  value: unknown,
  path: string,
): RawWithRefs | ResolveMiss {
  if (typeof value === "string" && (containsReference(value) || looksLikeExpression(value))) {
    const references: string[] = [];
    let substituted = value;
    for (const ref of parseReferences(value)) {
      const dep = resolvePath(ctx, ref, path);
      if (isResolveMiss(dep)) return dep;
      const numeric = numericFromResolution(dep);
      if (!numeric) return { kind: "type-mismatch", path, expected: type, got: dep.$type };
      references.push(ref, ...dep.references);
      substituted = substituted.split(`{${ref}}`).join(`${numeric.value}${numeric.unit}`);
    }
    const evaluated = evaluateExpression(substituted);
    if (!evaluated.ok) {
      return { kind: "bad-expression", path, expr: stringify(value), reason: evaluated.reason };
    }
    const raw: ResolvedValue =
      type === "number" ? evaluated.value : { value: evaluated.value, unit: evaluated.unit };
    return { raw, references: dedupe(references) };
  }

  if (type === "number") {
    const n = typeof value === "number" ? value : Number(String(value).trim());
    if (typeof value !== "number" && !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(String(value).trim())) {
      return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid number" };
    }
    if (!Number.isFinite(n)) {
      return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid number" };
    }
    return { raw: n, references: [] };
  }

  const dimension = parseDimensionLiteral(value);
  if (!dimension) {
    return { kind: "bad-expression", path, expr: stringify(value), reason: `invalid ${type}` };
  }
  return { raw: dimension, references: [] };
}

function resolveFontFamily(value: unknown, path: string): RawWithRefs | ResolveMiss {
  if (typeof value === "string") return { raw: value, references: [] };
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return { raw: value as string[], references: [] };
  }
  return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid fontFamily" };
}

function resolveFontWeight(value: unknown, path: string): RawWithRefs | ResolveMiss {
  if (typeof value === "number") return { raw: value, references: [] };
  if (typeof value === "string") {
    const weight = FONT_WEIGHT_KEYWORDS[value.toLowerCase()];
    if (weight !== undefined) return { raw: weight, references: [] };
  }
  return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid fontWeight" };
}

function resolveCubicBezier(value: unknown, path: string): RawWithRefs | ResolveMiss {
  if (Array.isArray(value) && value.length === 4 && value.every((v) => typeof v === "number")) {
    return { raw: value as number[] as ResolvedValue, references: [] };
  }
  return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid cubicBezier" };
}

function resolveStrokeStyle(value: unknown, path: string): RawWithRefs | ResolveMiss {
  if (typeof value === "string") return { raw: value, references: [] };
  if (value !== null && typeof value === "object") {
    return { raw: value as ResolvedValue, references: [] };
  }
  return { kind: "bad-expression", path, expr: stringify(value), reason: "invalid strokeStyle" };
}

// ─── Composite expansion ─────────────────────────────────────────────────────

function resolveComposite(
  ctx: Ctx,
  type: DtcgType,
  value: unknown,
  path: string,
): RawWithRefs | ResolveMiss {
  if (type === "shadow" && Array.isArray(value)) {
    const references: string[] = [];
    const layers: ResolvedValue[] = [];
    for (const layer of value) {
      const resolved = resolveCompositeObject(ctx, "shadow", layer, path);
      if (isResolveMiss(resolved)) return resolved;
      references.push(...resolved.references);
      layers.push(resolved.raw);
    }
    return { raw: layers, references: dedupe(references) };
  }

  if (type === "gradient") {
    if (!Array.isArray(value)) {
      return { kind: "bad-expression", path, expr: stringify(value), reason: "gradient must be an array of stops" };
    }
    const references: string[] = [];
    const stops: ResolvedValue[] = [];
    for (const stop of value) {
      if (stop === null || typeof stop !== "object") {
        return { kind: "bad-expression", path, expr: stringify(stop), reason: "invalid gradient stop" };
      }
      const record = stop as Record<string, unknown>;
      const color = resolveTypedValue(ctx, "color", record.color, path);
      if (isResolveMiss(color)) return color;
      const position = resolveTypedValue(ctx, "number", record.position, path);
      if (isResolveMiss(position)) return position;
      references.push(...color.references, ...position.references);
      stops.push({ color: color.raw, position: position.raw });
    }
    return { raw: stops, references: dedupe(references) };
  }

  return resolveCompositeObject(ctx, type, value, path);
}

function resolveCompositeObject(
  ctx: Ctx,
  type: DtcgType,
  value: unknown,
  path: string,
): RawWithRefs | ResolveMiss {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return { kind: "bad-expression", path, expr: stringify(value), reason: `invalid ${type} value` };
  }
  const record = value as Record<string, unknown>;
  const fields = COMPOSITE_FIELDS[type] ?? {};
  const references: string[] = [];
  const raw: Record<string, ResolvedValue> = {};

  for (const [field, subType] of Object.entries(fields)) {
    if (!(field in record)) continue; // optional sub-fields
    const resolved = resolveTypedValue(ctx, subType, record[field], path);
    if (isResolveMiss(resolved)) return resolved;
    references.push(...resolved.references);
    raw[field] = resolved.raw;
  }

  // Structural passthrough for non-typed sub-fields.
  if (type === "shadow" && "inset" in record) raw.inset = Boolean(record.inset);

  return { raw, references: dedupe(references) };
}

// ─── Color modifiers ─────────────────────────────────────────────────────────

function resolveColorModifier(
  ctx: Ctx,
  call: ColorModifierCall,
  path: string,
): { value: ColorValue; references: string[] } | ResolveMiss {
  const references: string[] = [];

  const resolveColorArg = (arg: string): ColorValue | ResolveMiss => {
    const refPath = asPureReference(arg);
    if (refPath) {
      const dep = resolvePath(ctx, refPath, path);
      if (isResolveMiss(dep)) return dep;
      if (dep.$type !== "color") {
        return { kind: "type-mismatch", path, expected: "color", got: dep.$type };
      }
      references.push(refPath, ...dep.references);
      const value = colorValueFromResolution(dep.raw);
      if (!value) {
        return { kind: "bad-expression", path, expr: arg, reason: "referenced value is not a color" };
      }
      return value;
    }
    const literal = parseColor(arg);
    if (!literal) return { kind: "bad-expression", path, expr: arg, reason: `invalid color "${arg}"` };
    return literal;
  };

  const amount = (raw: string | undefined): number | ResolveMiss => {
    const n = Number(raw);
    if (raw === undefined || !Number.isFinite(n)) {
      return { kind: "bad-expression", path, expr: `${call.fn}(…)`, reason: "expected a numeric amount" };
    }
    return n;
  };

  if (call.fn === "mix") {
    const a = resolveColorArg(call.args[0] ?? "");
    if (isResolveMiss(a)) return a;
    const b = resolveColorArg(call.args[1] ?? "");
    if (isResolveMiss(b)) return b;
    const weight = amount(call.args[2]);
    if (typeof weight !== "number") return weight;
    return { value: mix(a, b, weight), references: dedupe(references) };
  }

  const base = resolveColorArg(call.args[0] ?? "");
  if (isResolveMiss(base)) return base;
  const n = amount(call.args[1]);
  if (typeof n !== "number") return n;

  const value =
    call.fn === "lighten" ? lighten(base, n) : call.fn === "darken" ? darken(base, n) : withAlpha(base, n);
  return { value, references: dedupe(references) };
}

// ─── Value helpers ───────────────────────────────────────────────────────────

function numericFromResolution(
  resolution: TokenResolution,
): { value: number; unit: string } | null {
  if (resolution.$type === "number" && typeof resolution.raw === "number") {
    return { value: resolution.raw, unit: "" };
  }
  if (
    (resolution.$type === "dimension" || resolution.$type === "duration") &&
    isResolvedDimension(resolution.raw)
  ) {
    return { value: resolution.raw.value, unit: resolution.raw.unit };
  }
  return null;
}

function colorValueFromResolution(raw: ResolvedValue): ColorValue | null {
  if (raw !== null && typeof raw === "object" && "oklch" in raw && typeof raw.oklch === "string") {
    return parseColor(raw.oklch);
  }
  return null;
}

function isResolvedDimension(value: ResolvedValue): value is ResolvedDimension {
  return value !== null && typeof value === "object" && "value" in value && "unit" in value;
}

function parseDimensionLiteral(value: unknown): ResolvedDimension | null {
  if (typeof value === "number") return { value, unit: "" };
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.value === "number" && typeof record.unit === "string") {
      return { value: record.value, unit: record.unit };
    }
    return null;
  }
  if (typeof value === "string") {
    const match = /^([+-]?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i.exec(value.trim());
    if (match) return { value: parseFloat(match[1]!), unit: match[2] ?? "" };
  }
  return null;
}

function inferType(value: unknown): DtcgType | undefined {
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("#") || trimmed.startsWith("oklch(")) return "color";
    if (/^[+-]?(\d+\.?\d*|\.\d+)[a-z%]+$/i.test(trimmed)) return "dimension";
  }
  return undefined;
}

function dedupe(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function stringify(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value);
}
