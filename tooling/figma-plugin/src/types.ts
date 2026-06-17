/**
 * Minimal view of the DTCG `theme.json` the theme builder exports
 * (apps/marketing/.../utils/buildConfig.ts is the contract owner). Only the
 * parts the plugin consumes are typed; everything is read defensively.
 */

export interface DtcgToken {
  $type?: string;
  $value: string | number;
}

/** A token or a nested group of tokens. */
export type DtcgNode = DtcgToken | { [key: string]: DtcgNode };

/**
 * Icon settings (theme.json `$extensions`). Not design tokens — but when stroke
 * adjustment is on, the per-size stroke weights are materialised as Figma
 * variables (code scales strokes dynamically; Figma can't, so it needs them).
 */
export interface IconsConfig {
  style?: "outline" | "solid";
  strokeAdjustment?: boolean;
  /** Reference size where stroke == baseStroke. */
  baseSize?: number;
  /** Stroke width at the reference size. */
  baseStroke?: number;
}

export interface ThemeDoc {
  $description?: string;
  /** Used global color steps: primitive.color.<group>.<step> → { $value: "#hex" } */
  primitive?: { color?: Record<string, Record<string, DtcgToken>> };
  /** Semantic colors per mode; each $value is an alias `{primitive.color.…}` or a raw literal. */
  color?: { light?: Record<string, DtcgNode>; dark?: Record<string, DtcgNode> };
  /** Typography: font (fontFamily), weight (fontWeight), size + leading (dimension). */
  type?: Record<string, DtcgNode>;
  spacing?: Record<string, DtcgNode>;
  "border-radius"?: Record<string, DtcgNode>;
  component?: Record<string, DtcgNode>;
  $extensions?: {
    "com.ui-organized.theme-builder"?: { icons?: IconsConfig };
  };
}

/** Narrow a node to a leaf token (has a `$value`). */
export function isToken(node: DtcgNode | undefined): node is DtcgToken {
  return !!node && typeof node === "object" && "$value" in node;
}

/**
 * Walk a DTCG group, yielding every leaf token with its slash-joined path
 * (e.g. `surface/base`, `component/button/small-horizontal`). Figma renders
 * `/` in a variable name as nested groups.
 */
export function* flattenTokens(
  node: Record<string, DtcgNode> | undefined,
  prefix = "",
): Generator<{ path: string; token: DtcgToken }> {
  if (!node) return;
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}/${key}` : key;
    if (isToken(value)) yield { path, token: value };
    else if (value && typeof value === "object") yield* flattenTokens(value, path);
  }
}
