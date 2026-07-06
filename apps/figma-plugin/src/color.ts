/**
 * Color conversion at the Figma boundary. Figma COLOR variables take normalized
 * RGBA (each channel 0–1). The resolver emits `{ oklch, hex }`; we convert the
 * hex (incl. 8-digit alpha) here.
 */

export interface FigmaRGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

/** Parse `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa` into Figma RGBA (0–1), or null. */
export function hexToFigmaRgba(input: string): FigmaRGBA | null {
  const value = input.trim();
  if (!value.startsWith("#")) return null;
  const raw = value.slice(1);
  const hex = raw.length === 3 || raw.length === 4 ? raw.split("").map((c) => c + c).join("") : raw;
  if ((hex.length !== 6 && hex.length !== 8) || !/^[0-9a-fA-F]+$/.test(hex)) return null;
  return {
    r: clamp01(parseInt(hex.slice(0, 2), 16) / 255),
    g: clamp01(parseInt(hex.slice(2, 4), 16) / 255),
    b: clamp01(parseInt(hex.slice(4, 6), 16) / 255),
    a: hex.length === 8 ? clamp01(parseInt(hex.slice(6, 8), 16) / 255) : 1,
  };
}
