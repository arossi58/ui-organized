import { clsx } from "clsx";
import { adjustStrokeWidth, shouldAdjustStroke } from "@ds/utils";
import { useIconConfig } from "../../context/IconContext.js";
import { lucideIconSet } from "../../icons/lucide.js";
import { tablerIconSet } from "../../icons/tabler.js";
import { heroiconsOutlineSet, heroiconsSolidSet } from "../../icons/heroicons.js";
import type { IconProps } from "./Icon.types.js";
import "./Icon.css";

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

  // Resolve the correct component set
  let IconComponent: React.ComponentType<Record<string, unknown>> | undefined;
  if (library === "lucide") {
    IconComponent = lucideIconSet[name];
  } else if (library === "tabler") {
    IconComponent = tablerIconSet[name];
  } else {
    IconComponent = style === "solid" ? heroiconsSolidSet[name] : heroiconsOutlineSet[name];
  }

  if (!IconComponent) return null;

  // Build SVG props per library
  const svgProps: Record<string, unknown> = {};

  if (library === "lucide") {
    svgProps["size"] = size;
    if (shouldAdjustStroke(strokeAdjustment, style)) {
      svgProps["strokeWidth"] = adjustStrokeWidth(size, baseStroke, baseSize);
    }
  } else if (library === "tabler") {
    svgProps["size"] = size;
    if (shouldAdjustStroke(strokeAdjustment, style)) {
      svgProps["stroke"] = adjustStrokeWidth(size, baseStroke, baseSize);
    }
  } else {
    // Heroicons: size via width/height props + inline style
    svgProps["width"] = size;
    svgProps["height"] = size;
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
