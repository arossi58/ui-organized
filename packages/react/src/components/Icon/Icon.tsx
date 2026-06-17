import { clsx } from "clsx";
import { adjustStrokeWidth, shouldAdjustStroke } from "@ui-organized/utils";
import { useIconConfig } from "../../context/IconContext.js";
import { lucideIconSet } from "../../icons/lucide.js";
import { tablerIconSet, tablerSolidSet } from "../../icons/tabler.js";
import { heroiconsOutlineSet, heroiconsSolidSet } from "../../icons/heroicons.js";
import type { IconProps } from "./Icon.types.js";
import "./Icon.css";

/** The icon libraries (lucide/tabler/heroicons) all render in a 24-unit viewBox. */
const ICON_VIEWBOX = 24;

/**
 * Foundational Icon component — the single interface for rendering icons.
 *
 * Reads the active library, style, and stroke adjustment setting from
 * the nearest `IconProvider`. Resolves the canonical icon name to the
 * correct component for the active library and renders it at the
 * requested size, applying optical stroke correction when enabled.
 *
 * Components never import directly from lucide-react, @tabler/icons-react,
 * or @heroicons/react — they always go through this component.
 */
export function Icon({ name, size = 24, label, className }: IconProps) {
  const { library, style, strokeAdjustment, baseSize, baseStroke } = useIconConfig();

  // Resolve the component. A directly-supplied component (e.g. a lucide-react
  // icon) is used as-is — this keeps tree-shaking and needs no canonical name.
  // Otherwise resolve the canonical name against the active library's set.
  let IconComponent: React.ComponentType<Record<string, unknown>> | undefined;
  if (typeof name !== "string") {
    // A directly-supplied component. Note: library icons (e.g. lucide-react) are
    // `forwardRef` objects, not plain functions — so test for "not a string"
    // rather than "is a function".
    IconComponent = name;
  } else if (library === "lucide") {
    IconComponent = lucideIconSet[name];
  } else if (library === "tabler") {
    IconComponent = (style === "solid" ? tablerSolidSet[name] : undefined) ?? tablerIconSet[name];
  } else {
    IconComponent = style === "solid" ? heroiconsSolidSet[name] : heroiconsOutlineSet[name];
  }

  if (!IconComponent) return null;

  // Resolve the effective stroke for outline icons.
  // baseStroke is always applied so users see their chosen weight immediately.
  // When strokeAdjustment is on, the stroke follows the optical-compensation
  // curve. `adjustStrokeWidth` returns the desired *visual* (screen-pixel)
  // stroke, but lucide/tabler/heroicons all render in a 24-unit viewBox and
  // scale strokeWidth with the rendered size — so we convert back into viewBox
  // units (× 24 / size). Without this the size scaling is applied twice and
  // larger icons end up thicker instead of thinner. (Matches the icon-scaler
  // tool, which does the same screen-pixel → native-units conversion.)
  let effectiveStroke: number | undefined;
  if (style === "outline") {
    if (shouldAdjustStroke(strokeAdjustment, style) && size > 0) {
      effectiveStroke = (adjustStrokeWidth(size, baseStroke, baseSize) * ICON_VIEWBOX) / size;
    } else {
      effectiveStroke = baseStroke;
    }
  }

  // Build SVG props per library
  const svgProps: Record<string, unknown> = {};

  if (library === "lucide") {
    svgProps["size"] = size;
    if (effectiveStroke !== undefined) svgProps["strokeWidth"] = effectiveStroke;
  } else if (library === "tabler") {
    svgProps["size"] = size;
    if (effectiveStroke !== undefined) svgProps["stroke"] = effectiveStroke;
  } else {
    // Heroicons: size via width/height; stroke via strokeWidth SVG prop
    svgProps["width"] = size;
    svgProps["height"] = size;
    if (effectiveStroke !== undefined) svgProps["strokeWidth"] = effectiveStroke;
  }

  return (
    <span
      className={clsx("icon", className)}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
    >
      <IconComponent {...svgProps} />
    </span>
  );
}
