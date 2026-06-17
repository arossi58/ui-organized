/**
 * Color + dimension parsing for the values found in theme.json.
 *
 * Figma color variables take normalized RGBA (each channel 0–1); float
 * variables take a unitless number, so `"16px"` → `16`.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/**
 * Parse `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` / `rgb(...)` / `rgba(...)`
 * into Figma RGBA (0–1). Returns null for anything unrecognised.
 */
export function parseColor(input: string): RGBA | null {
  const value = input.trim();

  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expand = (h: string) =>
      h.length === 3 || h.length === 4
        ? h.split("").map((c) => c + c).join("")
        : h;
    const h = expand(hex);
    if (h.length !== 6 && h.length !== 8) return null;
    if (!/^[0-9a-fA-F]+$/.test(h)) return null;
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  const fn = /^rgba?\(([^)]+)\)$/i.exec(value);
  if (fn) {
    const parts = fn[1]!.split(/[,/]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (p: string) =>
      p.endsWith("%") ? (parseFloat(p) / 100) * 255 : parseFloat(p);
    const r = channel(parts[0]!) / 255;
    const g = channel(parts[1]!) / 255;
    const b = channel(parts[2]!) / 255;
    const a = parts[3] !== undefined
      ? (parts[3].endsWith("%") ? parseFloat(parts[3]) / 100 : parseFloat(parts[3]))
      : 1;
    if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
    return { r: clamp01(r), g: clamp01(g), b: clamp01(b), a: clamp01(a) };
  }

  return null;
}

/**
 * Convert Figma RGBA (0–1) back to a CSS string in the design system's style:
 * opaque colors become `#rrggbb`, translucent ones `rgba(r, g, b, a)` — matching
 * what the theme builder emits, so an export round-trips cleanly.
 */
export function rgbaToCss(c: { r: number; g: number; b: number; a?: number }): string {
  const to255 = (n: number) => Math.round(clamp01(n) * 255);
  const r = to255(c.r);
  const g = to255(c.g);
  const b = to255(c.b);
  const a = c.a ?? 1;
  if (a >= 1) {
    const hex = (n: number) => n.toString(16).padStart(2, "0");
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }
  return `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;
}

/** Parse a dimension value (`"16px"`, `"9999px"`, `24`, `"1.5"`) to a number. */
export function toFloat(value: string | number): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const px = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim());
  if (px) return Number(px[1]);
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
