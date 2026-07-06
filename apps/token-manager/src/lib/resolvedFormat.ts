import type { TokenResolution } from "@ui-organized/resolver";

/** The resolved hex of a color token, for swatches. */
export function colorHex(resolution: TokenResolution | undefined): string | undefined {
  const raw = resolution?.raw;
  if (resolution?.$type === "color" && raw && typeof raw === "object" && "hex" in raw) {
    return String((raw as { hex: unknown }).hex);
  }
  return undefined;
}

/** A short, human-readable form of a resolved value for table/inspector display. */
export function formatResolved(resolution: TokenResolution): string {
  const raw = resolution.raw;
  if (resolution.$type === "color" && raw && typeof raw === "object" && "hex" in raw) {
    return String((raw as { hex: unknown }).hex);
  }
  if (
    (resolution.$type === "dimension" || resolution.$type === "duration") &&
    raw &&
    typeof raw === "object" &&
    "value" in raw
  ) {
    const dim = raw as { value: number; unit: string };
    return `${dim.value}${dim.unit}`;
  }
  if (typeof raw === "string" || typeof raw === "number") return String(raw);
  return JSON.stringify(raw);
}
