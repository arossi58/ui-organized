/**
 * What loading a `theme.json` into the builder replaced.
 *
 * The builder stores its inputs (brand, neutral and tint, primary shade, type
 * scale, line heights, fonts, radius and spacing bases, icons) and derives every
 * color, spacing step, radius step and component size from them. It has no layer
 * for per-token overrides. So a file whose variables were edited, typically in
 * Figma through the Theme Import plugin, loads with those edits silently swapped
 * for derived values. Typography is the exception: sizes, leadings, fonts and
 * weights are read from the token tree and survive.
 *
 * This compares the loaded file with what the builder re-exports and names each
 * value that came out different, so the import can say so instead of the docs
 * promising a lossless round trip.
 */

import { listPhrase } from "../hooks/useGoogleFonts";

/** The token groups the builder re-derives rather than reads. */
export const DERIVED_SECTIONS = [
  "color",
  "primitive",
  "spacing",
  "border-radius",
  "component",
  "dimension",
] as const;

export type DerivedSection = (typeof DERIVED_SECTIONS)[number];

export interface ReplacedValue {
  /** Dot path in the theme.json, e.g. `color.dark.surface.primary`. */
  path: string;
  section: DerivedSection;
  /** The file's value, with an alias resolved through the file's own primitives. */
  file: string;
  /** What the builder put in its place, resolved the same way; null if nothing. */
  builder: string | null;
}

type Doc = Record<string, unknown>;

function isRecord(v: unknown): v is Doc {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Every `$value` leaf under `node`, keyed by dot path. */
function leaves(node: unknown, path: string, out: Map<string, unknown>): void {
  if (!isRecord(node)) return;
  if ("$value" in node) {
    out.set(path, node.$value);
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith("$")) leaves(child, `${path}.${key}`, out);
  }
}

/**
 * Follow `{a.b.c}` references through `doc` itself. Each document resolves
 * against its own primitives: a file whose semantic alias still points at
 * `brand.1400` but whose `brand.1400` hex was edited has changed color, and
 * comparing the alias text alone would miss it.
 */
function resolve(value: unknown, doc: Doc, depth = 0): string {
  const raw = String(value);
  const ref = /^\{([^}]+)\}$/.exec(raw.trim());
  if (!ref || depth > 8) return raw;
  let node: unknown = doc;
  for (const key of ref[1]!.split(".")) node = isRecord(node) ? node[key] : undefined;
  return isRecord(node) && "$value" in node ? resolve(node.$value, doc, depth + 1) : raw;
}

/** `#rgb`, `#rrggbb`, `#rrggbbaa` or `rgb()`/`rgba()` as `[r, g, b, a]` (0-255, 0-1). */
function parseColor(value: string): [number, number, number, number] | null {
  const v = value.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v);
  if (hex) {
    const h = hex[1]!.length === 3 ? [...hex[1]!].map((c) => c + c).join("") : hex[1]!;
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const fn = /^rgba?\(([^)]+)\)$/.exec(v);
  if (fn) {
    const parts = fn[1]!.split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.some((p) => Number.isNaN(p))) return null;
    return [parts[0]!, parts[1]!, parts[2]!, parts[3] ?? 1];
  }
  return null;
}

/** `"16px"`, `"16"` or `16` as a number. */
function parseNumber(value: string): number | null {
  const m = /^(-?\d+(?:\.\d+)?)(px)?$/.exec(value.trim());
  return m ? Number(m[1]) : null;
}

/**
 * Equal for a person's purposes. Figma hands colors back as floats and writes
 * `rgba()` where the builder may have written 8-digit hex, and its numbers are
 * 32-bit (`12.8` returns as `12.800000190734863`), so exact string comparison
 * would report a round trip nobody touched.
 */
function sameValue(a: string, b: string): boolean {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (ca && cb) {
    return (
      ca[0] === cb[0] && ca[1] === cb[1] && ca[2] === cb[2] && Math.abs(ca[3] - cb[3]) <= 0.006
    );
  }
  const na = parseNumber(a);
  const nb = parseNumber(b);
  if (na !== null && nb !== null) return Math.abs(na - nb) < 0.01;
  return a.trim() === b.trim();
}

/**
 * The values in `file` that `derived` (the builder's export after loading it)
 * does not reproduce, in file order. Only the file's own leaves are compared,
 * so a group the file leaves out, or a token the builder adds, is not a
 * replacement.
 */
export function diffThemeTokens(file: unknown, derived: unknown): ReplacedValue[] {
  if (!isRecord(file) || !isRecord(derived)) return [];
  const out: ReplacedValue[] = [];
  for (const section of DERIVED_SECTIONS) {
    const mine = new Map<string, unknown>();
    const theirs = new Map<string, unknown>();
    leaves(file[section], section, mine);
    leaves(derived[section], section, theirs);
    for (const [path, value] of mine) {
      const fileValue = resolve(value, file);
      const builderValue = theirs.has(path) ? resolve(theirs.get(path), derived) : null;
      if (builderValue === null || !sameValue(fileValue, builderValue)) {
        out.push({ path, section, file: fileValue, builder: builderValue });
      }
    }
  }
  return out;
}

const NOUNS: Record<DerivedSection, [string, string]> = {
  color: ["semantic color", "semantic colors"],
  primitive: ["primitive color", "primitive colors"],
  spacing: ["spacing value", "spacing values"],
  "border-radius": ["radius value", "radius values"],
  component: ["component size", "component sizes"],
  dimension: ["fixed dimension", "fixed dimensions"],
};

/** `"3 semantic colors and 1 spacing value"`, or null when nothing was replaced. */
export function describeReplaced(changes: ReplacedValue[]): string | null {
  const parts = DERIVED_SECTIONS.flatMap((section) => {
    const n = changes.filter((c) => c.section === section).length;
    return n === 0 ? [] : [`${n} ${NOUNS[section][n === 1 ? 0 : 1]}`];
  });
  return parts.length > 0 ? listPhrase(parts) : null;
}
