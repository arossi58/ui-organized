/**
 * OKLCH ⇄ sRGB.
 *
 * The colour machines the four libraries drive model `rgba`/`hsla`/`hsba` and
 * their parsers reject `oklch(...)` outright, so OKLCH cannot be a machine
 * format the way RGB and HSL are — it has to be converted at the edge.
 * Everything here is arithmetic on plain numbers: no DOM, no `Color` objects,
 * nothing imported from any framework, which is what lets one copy sit in core
 * and serve React, Svelte, Vue and Angular rather than four copies drifting.
 *
 * The transform is Björn Ottosson's OKLab, which is what CSS Color 4 defines
 * `oklch()` against: https://bottosson.github.io/posts/oklab/
 *
 * sRGB is the destination gamut, and OKLCH can address colours sRGB cannot show
 * — `oklch(0.7 0.35 150)` is well outside it. Those are clipped per channel on
 * the way in rather than rejected: a picker that refuses a valid CSS colour is
 * worse than one that shows the nearest colour it can actually display.
 */

/** sRGB with 8-bit channels, the form the colour machine works in. */
export interface Rgba {
  /** 0–255 */
  r: number;
  /** 0–255 */
  g: number;
  /** 0–255 */
  b: number;
  /** 0–1 */
  a: number;
}

export interface Oklch {
  /** Perceptual lightness, 0–1. */
  l: number;
  /** Chroma, 0 to ~0.37 within sRGB. */
  c: number;
  /** Hue angle in degrees, 0–360. */
  h: number;
  /** 0–1 */
  a: number;
}

/* ─── Gamma ─────────────────────────────────────────────────────────────────
   sRGB stores light non-linearly; the matrices below only hold for linear
   light, so every conversion crosses this boundary twice. */

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const toGamma = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** The clip that keeps an out-of-gamut OKLCH colour displayable. */
const to8Bit = (n: number) => Math.round(clamp01(n) * 255);

export function rgbaToOklch({ r, g, b, a }: Rgba): Oklch {
  const lr = toLinear(r / 255);
  const lg = toLinear(g / 255);
  const lb = toLinear(b / 255);

  // Linear sRGB → LMS cone response, then a cube root to make it perceptual.
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  const okL = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const okA = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const okB = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const chroma = Math.hypot(okA, okB);
  // Hue is meaningless without chroma, and atan2 on two near-zero numbers is
  // noise — grey would otherwise come back with an arbitrary angle that changes
  // every time it round-trips.
  const hue = chroma < 1e-6 ? 0 : ((Math.atan2(okB, okA) * 180) / Math.PI + 360) % 360;

  return { l: okL, c: chroma, h: hue, a };
}

export function oklchToRgba({ l, c, h, a }: Oklch): Rgba {
  const rad = (h * Math.PI) / 180;
  const okA = c * Math.cos(rad);
  const okB = c * Math.sin(rad);

  const lms_l = (l + 0.3963377774 * okA + 0.2158037573 * okB) ** 3;
  const lms_m = (l - 0.1055613458 * okA - 0.0638541728 * okB) ** 3;
  const lms_s = (l - 0.0894841775 * okA - 1.291485548 * okB) ** 3;

  const lr = 4.0767416621 * lms_l - 3.3077115913 * lms_m + 0.2309699292 * lms_s;
  const lg = -1.2684380046 * lms_l + 2.6097574011 * lms_m - 0.3413193965 * lms_s;
  const lb = -0.0041960863 * lms_l - 0.7034186147 * lms_m + 1.707614701 * lms_s;

  return {
    r: to8Bit(toGamma(lr)),
    g: to8Bit(toGamma(lg)),
    b: to8Bit(toGamma(lb)),
    a: clamp01(a),
  };
}

/* ─── Strings ───────────────────────────────────────────────────────────────
   The bar for the printed precision is that every one of the 16.7M 8-bit sRGB
   colours survives `format` → `parse` unchanged: a reader who opens the text
   field and presses enter without editing must not have silently shifted their
   colour. Four decimals is not quite enough — saturated colours near the gamut
   edge, where a hair of hue moves a whole channel, came back off by one. Five
   holds (see the round-trip test). Trailing zeros are trimmed, so the colours
   people actually type stay legible: white is `oklch(1 0 0)`. */

const trim = (n: number, places: number) => Number(n.toFixed(places)).toString();

/**
 * `0.62796 0.25768 29.234` — the components alone, for the picker's text field,
 * which the notation select already labels. Dropping the wrapper is what makes
 * an OKLCH colour fit a field this narrow at full precision.
 */
export function formatOklchComponents(rgba: Rgba): string {
  const { l, c, h, a } = rgbaToOklch(rgba);
  const base = `${trim(l, 5)} ${trim(c, 5)} ${trim(h, 3)}`;
  return a >= 1 ? base : `${base} / ${trim(a, 4)}`;
}

/** `oklch(0.62796 0.25768 29.234)`, with ` / a` only when the colour is not opaque. */
export function formatOklch(rgba: Rgba): string {
  return `oklch(${formatOklchComponents(rgba)})`;
}

/**
 * Reads what a person is likely to type into the field, which is a wider set
 * than the CSS grammar: the `oklch()` wrapper is optional, components may be
 * separated by commas as well as spaces, and `none` is accepted for any of them
 * (CSS Color 4 allows it and it resolves to zero here).
 *
 * Returns `null` for anything it cannot read, which the caller shows as a
 * rejected edit rather than guessing at a colour.
 */
export function parseOklch(input: string): Rgba | null {
  const body = input
    .trim()
    .replace(/^oklch\s*\(([\s\S]*)\)$/i, "$1")
    .trim();
  if (!body) return null;

  const [components = "", alphaPart, ...rest] = body.split("/");
  if (rest.length) return null;

  const [lightness, chroma, hue, ...extra] = components
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (lightness == null || chroma == null || hue == null || extra.length) return null;

  const l = readNumber(lightness, 1);
  // A chroma percentage is defined against 0.4, not 1 — `50%` is `0.2`.
  const c = readNumber(chroma, 0.4);
  const h = readAngle(hue);
  const a = alphaPart === undefined ? 1 : readNumber(alphaPart.trim(), 1);
  if (l == null || c == null || h == null || a == null) return null;

  return oklchToRgba({ l: clamp01(l), c: Math.max(0, c), h, a: clamp01(a) });
}

/** A CSS number or percentage. `percentBasis` is what `100%` means. */
function readNumber(token: string, percentBasis: number): number | null {
  if (/^none$/i.test(token)) return 0;
  const percent = /^([+-]?(?:\d*\.)?\d+)%$/.exec(token);
  if (percent?.[1]) return (Number(percent[1]) / 100) * percentBasis;
  if (!/^[+-]?(?:\d*\.)?\d+$/.test(token)) return null;
  return Number(token);
}

const ANGLE_UNITS: Record<string, number> = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };

function readAngle(token: string): number | null {
  if (/^none$/i.test(token)) return 0;
  const match = /^([+-]?(?:\d*\.)?\d+)(deg|grad|rad|turn)?$/i.exec(token);
  if (!match?.[1]) return null;
  const unit = match[2] ? (ANGLE_UNITS[match[2].toLowerCase()] ?? 1) : 1;
  const degrees = Number(match[1]) * unit;
  return ((degrees % 360) + 360) % 360;
}
