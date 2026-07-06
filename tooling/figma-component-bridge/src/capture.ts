/**
 * The DOM capture contract (COMPONENT-PLUGIN.md §3, Phase 3).
 *
 * The serialisable snapshot the renderer's in-page script extracts from a
 * rendered component, and the only thing the normalizer reads. Keeping this a
 * plain data shape (no DOM handles) is what lets the normalizer run — and be
 * unit-tested — without a browser.
 *
 * Two parallel sources of token information per node:
 *   - `varRefs`  — the **authored** `var(--…)` reference behind a property, read
 *      from CDP matched styles. Unambiguous: `backgroundColor →
 *      --color-interactive-primary-default`. This is how a token reference
 *      survives capture instead of collapsing to a resolved `rgb()`.
 *   - `tokens`   — every token custom property's **resolved** value on the node
 *      (`getComputedStyle().getPropertyValue('--…')`). Used to fill `fallbacks`
 *      and as a reverse-match fallback when `varRefs` is unavailable.
 */

/** Text-relevant computed styles copied onto a text-node capture (from its parent). */
export const CAPTURED_TEXT_STYLES = ["color", "fontFamily", "fontSize", "fontWeight", "lineHeight"] as const;

/** The computed-style properties the renderer captures (camelCase). */
export const CAPTURED_STYLES = [
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "gap",
  "rowGap",
  "columnGap",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "backgroundColor",
  "color",
  "borderTopWidth",
  "borderTopStyle",
  "borderTopColor",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "position",
  "opacity",
] as const;

/** Properties we try to resolve back to an authored token reference. */
export const VAR_BEARING_PROPERTIES = [
  "backgroundColor",
  "color",
  "borderTopColor",
  "borderTopLeftRadius",
  "fontSize",
] as const;

export interface CaptureRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureNode {
  /** Lowercase tag name, e.g. "button", "span". `#text` for a text run. */
  tag: string;
  /** First class token, if any — used for a friendlier Figma node name. */
  className?: string;
  rect: CaptureRect;
  /** Curated computed styles (subset of {@link CAPTURED_STYLES}). */
  styles: Record<string, string>;
  /** Authored `var(--…)` behind a property, from CDP matched styles. */
  varRefs?: Record<string, string>;
  /** Token custom property → resolved value, for fallback + reverse-match. */
  tokens?: Record<string, string>;
  /** Text content when this is a text run (`tag === "#text"`). */
  text?: string;
  /** Raw SVG markup when this node is an `<svg>` (an icon) — not recursed into. */
  svg?: string;
  /** Icon name parsed from the SVG class (e.g. lucide `plus`), for component matching. */
  iconName?: string;
  children: CaptureNode[];
}

export interface VariantCapture {
  /** Prop values for this render, including the pseudo-axis `state`. */
  props: Record<string, string>;
  root: CaptureNode;
}

export interface ComponentCapture {
  component: string;
  storyId: string;
  variants: VariantCapture[];
}
