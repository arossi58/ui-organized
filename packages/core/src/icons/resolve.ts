/**
 * Everything `Icon` decides before it renders anything.
 *
 * Which component to draw, how thick its stroke should be, and which props that
 * particular icon library wants those numbers under — none of it involves a
 * renderer, and all of it has to agree across the React, Svelte, Vue and Angular
 * libraries or the same icon comes out a different weight in each.
 */

import { adjustStrokeWidth, shouldAdjustStroke } from "@ui-organized/utils";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconLibrary, IconSet } from "./registry.js";

/** The icon libraries (lucide/tabler/heroicons) all render in a 24-unit viewBox. */
export const ICON_VIEWBOX = 24;

export type IconStyle = "outline" | "solid";

/** The `IconProvider` configuration, generic over the framework's component type. */
export interface IconConfig<TComponent> {
  /**
   * Active icon library. The set itself must be registered by importing its
   * subpath once, or passed as `icons`. See `./registry.ts` for why the package
   * deliberately imports none of the icon libraries itself.
   */
  library: IconLibrary;
  /** Icon style — outline/stroke or solid/filled. */
  style: IconStyle;
  /**
   * When true, stroke width is adjusted per size to maintain consistent optical
   * weight. Only applies to outline style.
   */
  strokeAdjustment: boolean;
  /**
   * The design/reference size in pixels at which the base stroke is defined. At
   * this size no adjustment is made.
   */
  baseSize: number;
  /** Stroke width at the reference size — 2 matches Lucide and Tabler natively. */
  baseStroke: number;
  /**
   * The icon set supplied explicitly rather than through the import-side-effect
   * registry. Takes precedence over `library`, and is the option to reach for if
   * you'd rather not depend on module side effects.
   */
  icons?: IconSet<TComponent>;
}

export const DEFAULT_ICON_CONFIG: Omit<IconConfig<never>, "icons"> = {
  library: "lucide",
  style: "outline",
  strokeAdjustment: false,
  baseSize: 24,
  baseStroke: 2,
};

/**
 * The effective stroke for an outline icon, in the library's own viewBox units.
 *
 * `baseStroke` is always applied so a chosen weight shows up immediately. When
 * `strokeAdjustment` is on the stroke follows the optical-compensation curve —
 * but `adjustStrokeWidth` returns the desired *visual* (screen-pixel) stroke,
 * and these libraries scale `strokeWidth` with the rendered size, so it has to
 * be converted back into viewBox units. Without that the size scaling is applied
 * twice and larger icons come out thicker instead of thinner. (The icon-scaler
 * tool does the same screen-pixel → native-units conversion.)
 *
 * Solid icons have no stroke, and get `undefined`.
 */
export function resolveIconStroke(config: {
  style: IconStyle;
  strokeAdjustment: boolean;
  size: number;
  baseStroke: number;
  baseSize: number;
}): number | undefined {
  const { style, strokeAdjustment, size, baseStroke, baseSize } = config;
  if (style !== "outline") return undefined;
  if (shouldAdjustStroke(strokeAdjustment, style) && size > 0) {
    return (adjustStrokeWidth(size, baseStroke, baseSize) * ICON_VIEWBOX) / size;
  }
  return baseStroke;
}

/**
 * Pick the component for a canonical name, falling back to the outline cut when
 * a library ships no solid variant for it — Lucide ships no solid set at all.
 */
export function resolveIconComponent<TComponent>(
  set: IconSet<TComponent> | undefined,
  name: CanonicalIconName,
  style: IconStyle,
): TComponent | undefined {
  if (!set) return undefined;
  const solid = style === "solid" ? set.solid?.[name] : undefined;
  return solid ?? set.outline[name];
}

/**
 * The sizing and stroke props for one icon, in the shape its library expects.
 *
 * The libraries disagree — Lucide takes `size`/`strokeWidth`, Tabler
 * `size`/`stroke`, Heroicons `width`/`height`/`strokeWidth` — so the mapping
 * belongs to the adapter. A directly-supplied component has no adapter, and gets
 * the Lucide-shaped props it most likely expects.
 */
export function resolveIconSvgProps<TComponent>(
  set: IconSet<TComponent> | undefined,
  size: number,
  stroke: number | undefined,
): Record<string, unknown> {
  if (set) return set.svgProps(size, stroke);
  return { size, ...(stroke !== undefined ? { strokeWidth: stroke } : {}) };
}
