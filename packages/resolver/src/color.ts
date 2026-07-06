import {
  parseToOklch,
  oklchColorToHex,
  formatOklchColor,
  type OklchColor,
} from "@ui-organized/utils";
import type { ResolvedColor } from "./types.js";

/**
 * Color literal parsing and OKLCH modifiers (lighten / darken / mix / alpha).
 *
 * All modifier math is pure and deterministic and operates in OKLCH, consistent
 * with the system's color model; both `oklch` and `hex` are emitted. Reference
 * resolution for modifier color arguments happens in `resolve.ts`, which holds
 * the resolution context — this module only does the math.
 *
 * NOTE (Phase 7 escalation): `lighten`/`darken` are defined as additive on
 * OKLCH L. If exact Tokens Studio import compatibility is later required, confirm
 * TS's rounding / sRGB-vs-OKLCH behavior before treating these snapshots as the
 * cross-tool contract.
 */

/** An OKLCH color plus straight alpha in [0, 1]. */
export interface ColorValue {
  color: OklchColor;
  alpha: number;
}

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

// ─── Parsing ─────────────────────────────────────────────────────────────────

/** Normalizes #rgb / #rgba / #rrggbb / #rrggbbaa into 6-digit rgb + alpha. */
export function splitHexAlpha(hex: string): { rgb: string; alpha: number } | null {
  const h = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  let rgb: string;
  let alphaHex = "ff";
  if (h.length === 3) {
    rgb = h.split("").map((c) => c + c).join("");
  } else if (h.length === 4) {
    rgb = h.slice(0, 3).split("").map((c) => c + c).join("");
    alphaHex = h[3]! + h[3]!;
  } else if (h.length === 6) {
    rgb = h;
  } else if (h.length === 8) {
    rgb = h.slice(0, 6);
    alphaHex = h.slice(6, 8);
  } else {
    return null;
  }
  return { rgb: `#${rgb}`, alpha: parseInt(alphaHex, 16) / 255 };
}

/** Extracts a `/ alpha` suffix from an `oklch(...)` string, if present. */
function oklchAlpha(input: string): number {
  const match = /\/\s*([0-9.]+%?)\s*\)/.exec(input);
  if (!match) return 1;
  const raw = match[1]!;
  return raw.endsWith("%") ? clamp01(parseFloat(raw) / 100) : clamp01(parseFloat(raw));
}

/**
 * Parses a color literal (hex, `oklch(...)`, or a structured DTCG color object)
 * into an {@link ColorValue}, or `null` if it cannot be parsed. References are
 * NOT handled here.
 */
export function parseColor(value: unknown): ColorValue | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("#")) {
      const split = splitHexAlpha(trimmed);
      if (!split) return null;
      try {
        return { color: parseToOklch(split.rgb), alpha: split.alpha };
      } catch {
        return null;
      }
    }
    if (trimmed.startsWith("oklch(")) {
      try {
        return { color: parseToOklch(trimmed), alpha: oklchAlpha(trimmed) };
      } catch {
        return null;
      }
    }
    return null;
  }

  if (value !== null && typeof value === "object") {
    return parseColorObject(value as Record<string, unknown>);
  }

  return null;
}

function parseColorObject(obj: Record<string, unknown>): ColorValue | null {
  const alpha = typeof obj.alpha === "number" ? clamp01(obj.alpha) : 1;
  const space = typeof obj.colorSpace === "string" ? obj.colorSpace : undefined;
  const components = Array.isArray(obj.components)
    ? obj.components.map((c) => (c === "none" ? 0 : Number(c)))
    : undefined;

  if (space === "oklch" && components && components.length >= 3) {
    return { color: { l: components[0]!, c: components[1]!, h: components[2]! }, alpha };
  }
  if (space === "srgb" && components && components.length >= 3) {
    const hex =
      "#" +
      components
        .slice(0, 3)
        .map((c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, "0"))
        .join("");
    try {
      return { color: parseToOklch(hex), alpha };
    } catch {
      return null;
    }
  }
  // Fall back to an explicit hex field (common in DTCG color objects).
  if (typeof obj.hex === "string") {
    const fromHex = parseColor(obj.hex);
    return fromHex ? { color: fromHex.color, alpha } : null;
  }
  return null;
}

// ─── Emit ────────────────────────────────────────────────────────────────────

/** Produces the resolved `{ oklch, hex }` pair, encoding alpha when below 1. */
export function toResolvedColor({ color, alpha }: ColorValue): ResolvedColor {
  const hex6 = oklchColorToHex(color);
  const a = clamp01(alpha);
  if (a >= 1) {
    return { oklch: formatOklchColor(color), hex: hex6 };
  }
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, "0");
  const oklch = `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${color.h.toFixed(1)} / ${a.toFixed(3)})`;
  return { oklch, hex: hex6 + alphaHex };
}

// ─── Modifiers (pure OKLCH math) ─────────────────────────────────────────────

export function lighten(value: ColorValue, amount: number): ColorValue {
  return { color: { ...value.color, l: clamp01(value.color.l + amount) }, alpha: value.alpha };
}

export function darken(value: ColorValue, amount: number): ColorValue {
  return { color: { ...value.color, l: clamp01(value.color.l - amount) }, alpha: value.alpha };
}

export function withAlpha(value: ColorValue, amount: number): ColorValue {
  return { color: value.color, alpha: clamp01(amount) };
}

/** Mix `a` toward `b` by `weight` (0 = all a, 1 = all b), interpolating in OKLCH. */
export function mix(a: ColorValue, b: ColorValue, weight: number): ColorValue {
  const t = clamp01(weight);
  return {
    color: {
      l: lerp(a.color.l, b.color.l, t),
      c: lerp(a.color.c, b.color.c, t),
      h: lerpHue(a.color.h, b.color.h, t),
    },
    alpha: lerp(a.alpha, b.alpha, t),
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Interpolate hue along the shortest arc, result normalized to [0, 360). */
function lerpHue(h1: number, h2: number, t: number): number {
  const delta = (((h2 - h1) % 360) + 540) % 360 - 180;
  const h = h1 + delta * t;
  return ((h % 360) + 360) % 360;
}

// ─── Modifier-call parsing ───────────────────────────────────────────────────

export type ColorModifierFn = "lighten" | "darken" | "mix" | "alpha";

export interface ColorModifierCall {
  fn: ColorModifierFn;
  args: string[];
}

const MODIFIER_CALL = /^\s*(lighten|darken|mix|alpha)\s*\(([\s\S]*)\)\s*$/;

/**
 * Parses a color-modifier call like `lighten({color.brand}, 0.1)` into its
 * function and trimmed argument list, or `null` if the value is not a modifier.
 * Arguments are split on top-level commas (color refs, hex, and numbers never
 * contain commas).
 */
export function parseColorModifier(value: unknown): ColorModifierCall | null {
  if (typeof value !== "string") return null;
  const match = MODIFIER_CALL.exec(value);
  if (!match) return null;
  const fn = match[1] as ColorModifierFn;
  const args = match[2]!
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
  return { fn, args };
}
