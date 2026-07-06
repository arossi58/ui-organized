/**
 * OKLCH palette generation algorithm.
 *
 * Given a single brand color (hex or oklch string), produces a full 24-stop
 * shade ramp (100–2400) where each stop has both hex and oklch representations.
 *
 * The algorithm:
 *   1. Parse the input to OKLCH.
 *   2. Fix the chroma and hue from the input color.
 *   3. Map each ramp step to a target lightness value.
 *   4. Scale chroma by a per-step envelope (peaks at the mid-dark plateau) so
 *      light/dark stops read as near-neutral tints, then let the sRGB conversion
 *      gamut-clamp the saturated mid-range.
 *   5. Convert each stop back to sRGB hex.
 *
 * The lightness curve and chroma envelope are derived from the authored core
 * color library (the brand-typical red/orange/blue/purple families), so a
 * generated ramp from a custom hex sits in the same visual system as the
 * named core families. See packages/tokens core-color for the source data.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColorSwatch {
  hex: string;
  oklch: string;
}

export type ColorRamp = Record<string, ColorSwatch>;

export interface OklchColor {
  l: number; // 0–1
  c: number; // 0–0.4 approx
  h: number; // 0–360
}

// ─── Ramp step configuration ──────────────────────────────────────────────────

/**
 * Target lightness (OKLCH L) for each ramp step.
 * Steps 100 (lightest) → 2400 (darkest) follow a perceptual curve.
 * 24 steps matching the core color library architecture.
 */
const RAMP_STEPS: Record<string, number> = {
  "100":  0.990,
  "200":  0.952,
  "300":  0.913,
  "400":  0.875,
  "500":  0.837,
  "600":  0.799,
  "700":  0.760,
  "800":  0.722,
  "900":  0.684,
  "1000": 0.646,
  "1100": 0.608,
  "1200": 0.569,
  "1300": 0.530,
  "1400": 0.491,
  "1500": 0.452,
  "1600": 0.413,
  "1700": 0.374,
  "1800": 0.335,
  "1900": 0.295,
  "2000": 0.257,
  "2100": 0.217,
  "2200": 0.178,
  "2300": 0.138,
  "2400": 0.100,
};

/**
 * Chroma scale factor per step — a normalized envelope that rises to a plateau
 * across the mid-dark steps (1000–1300) and tapers at the light/dark ends, so
 * those stops read as near-neutral tints rather than saturated colours.
 * Derived from the core library's brand-typical families.
 */
const CHROMA_SCALE: Record<string, number> = {
  "100":  0.024,
  "200":  0.118,
  "300":  0.218,
  "400":  0.320,
  "500":  0.429,
  "600":  0.544,
  "700":  0.667,
  "800":  0.797,
  "900":  0.933,
  "1000": 0.998,
  "1100": 0.998,
  "1200": 0.998,
  "1300": 0.998,
  "1400": 0.969,
  "1500": 0.906,
  "1600": 0.836,
  "1700": 0.761,
  "1800": 0.682,
  "1900": 0.602,
  "2000": 0.523,
  "2100": 0.443,
  "2200": 0.365,
  "2300": 0.286,
  "2400": 0.209,
};

// ─── Parsing ──────────────────────────────────────────────────────────────────

/**
 * Parse a hex string (#rgb or #rrggbb) to linear-light [r, g, b] in 0–1.
 */
function hexToLinearRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const expanded =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const r = parseInt(expanded.slice(0, 2), 16) / 255;
  const g = parseInt(expanded.slice(2, 4), 16) / 255;
  const b = parseInt(expanded.slice(4, 6), 16) / 255;

  return [gammaToLinear(r), gammaToLinear(g), gammaToLinear(b)];
}

function gammaToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearToGamma(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Linear RGB → OKLab
 * https://bottosson.github.io/posts/oklab/
 */
function linearRgbToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

/**
 * OKLab → linear RGB
 */
function oklabToLinearRgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/**
 * OKLab → OKLCH (cylindrical)
 */
function oklabToOklch(L: number, a: number, b: number): OklchColor {
  const c = Math.sqrt(a * a + b * b);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { l: L, c, h: h < 0 ? h + 360 : h };
}

/**
 * OKLCH → OKLab
 */
function oklchToOklab(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180;
  return [l, c * Math.cos(hRad), c * Math.sin(hRad)];
}

/**
 * Parse an oklch() CSS string to OklchColor.
 * Supports both space-separated and comma-separated formats.
 */
function parseOklchString(oklchStr: string): OklchColor {
  const inner = oklchStr.trim().replace(/^oklch\(/, "").replace(/\)$/, "");
  // Handle "none" keyword (treat as 0) and strip % from lightness
  const parts = inner
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) => {
      if (p === "none") return 0;
      if (p.endsWith("%")) return parseFloat(p) / 100;
      return parseFloat(p);
    }) as [number, number, number];

  return { l: parts[0] ?? 0, c: parts[1] ?? 0, h: parts[2] ?? 0 };
}

// ─── Conversion to hex ────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, v));
}

function oklchToHex(l: number, c: number, h: number): string {
  const [la, a, b] = oklchToOklab(l, c, h);
  const [lr, lg, lb] = oklabToLinearRgb(la, a, b);
  const r = Math.round(clamp(linearToGamma(lr)) * 255);
  const g = Math.round(clamp(linearToGamma(lg)) * 255);
  const bVal = Math.round(clamp(linearToGamma(lb)) * 255);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bVal.toString(16).padStart(2, "0")}`;
}

function oklchToString(l: number, c: number, h: number): string {
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert an {@link OklchColor} to a 6-digit sRGB hex string (gamut-clamped).
 * Pure and deterministic. Alpha is not represented — callers that need alpha
 * compose it on top of this base hex.
 */
export function oklchColorToHex(color: OklchColor): string {
  return oklchToHex(color.l, color.c, color.h);
}

/**
 * Format an {@link OklchColor} as a CSS `oklch()` string with the system's
 * canonical precision (L/C to 3 dp, H to 1 dp). Alpha is not included.
 */
export function formatOklchColor(color: OklchColor): string {
  return oklchToString(color.l, color.c, color.h);
}

/**
 * Parse any supported color input to OKLCH.
 * Supports: "#rrggbb", "#rgb", "oklch(...)"
 */
export function parseToOklch(input: string): OklchColor {
  const trimmed = input.trim();
  if (trimmed.startsWith("oklch(")) {
    return parseOklchString(trimmed);
  }
  if (trimmed.startsWith("#")) {
    const [r, g, b] = hexToLinearRgb(trimmed);
    const [L, a, bVal] = linearRgbToOklab(r, g, b);
    return oklabToOklch(L, a, bVal);
  }
  throw new Error(`Unsupported color format: "${input}". Expected "#rrggbb" or "oklch(...)"`.trim());
}

/**
 * Generate a full 24-stop brand color ramp from a single color input.
 *
 * @param input - Hex string or oklch() string for the brand color.
 * @returns Record of step name → ColorSwatch (hex + oklch).
 */
export function generateColorRamp(input: string): ColorRamp {
  const { c: sourceChroma, h: sourceHue } = parseToOklch(input);

  const ramp: ColorRamp = {};

  for (const [step, targetLightness] of Object.entries(RAMP_STEPS)) {
    const chromaScale = CHROMA_SCALE[step] ?? 1;
    const c = sourceChroma * chromaScale;
    const h = sourceHue;

    const hex = oklchToHex(targetLightness, c, h);
    const oklch = oklchToString(targetLightness, c, h);
    ramp[step] = { hex, oklch };
  }

  return ramp;
}
