import { clsx } from "clsx";
import { adjustStrokeWidth, shouldAdjustStroke } from "@ui-organized/utils";
import { useIconConfig } from "../../context/IconContext.js";
import { getIconSet, registeredLibraries, type IconSet } from "../../icons/registry.js";
import { warnMissingIconSet } from "./warnMissingIconSet.js";
import type { IconProps } from "./Icon.types.js";
import "./Icon.css";

/** The icon libraries (lucide/tabler/heroicons) all render in a 24-unit viewBox. */
const ICON_VIEWBOX = 24;

/**
 * Foundational Icon component — the single interface for rendering icons.
 *
 * Reads the active library, style, and stroke adjustment setting from the
 * nearest `IconProvider`, resolves the canonical name against that library's
 * registered set, and renders it at the requested size with optical stroke
 * correction when enabled.
 *
 * The set has to be registered by importing its subpath — see
 * `../../icons/registry.ts` for why the core deliberately imports none of the
 * icon libraries itself:
 *
 * ```ts
 * import "@ui-organized/react/icons/lucide";
 * ```
 *
 * Components never import from lucide-react, @tabler/icons-react or
 * @heroicons/react directly — they always go through this component.
 */
export function Icon({ name, size = 24, label, className }: IconProps) {
  const { library, style, strokeAdjustment, baseSize, baseStroke, icons } = useIconConfig();

  // A directly-supplied component is used as-is — it keeps tree-shaking, needs
  // no canonical name, and needs no registered set. Note that library icons are
  // `forwardRef` objects rather than plain functions, so this tests for "not a
  // string" rather than "is a function".
  const supplied = typeof name !== "string" ? name : undefined;

  // An explicit `icons` on the provider wins; otherwise use whatever the
  // imported subpath registered.
  const set: IconSet | undefined = supplied ? undefined : (icons ?? getIconSet(library));

  if (!supplied && !set) {
    // The one failure this restructure could introduce: upgrading without adding
    // the subpath import renders nothing at all. Silence would be indefensible,
    // so say exactly what to add. Dev-only, and once per library.
    warnMissingIconSet(library, registeredLibraries());
    return null;
  }

  let IconComponent: React.ComponentType<Record<string, unknown>> | undefined;
  if (supplied) {
    IconComponent = supplied;
  } else if (set) {
    // Fall back to the outline cut when a library has no solid variant for this
    // name — Lucide ships no solid set at all.
    IconComponent =
      (style === "solid" ? set.solid?.[name as keyof typeof set.solid] : undefined) ??
      set.outline[name as keyof typeof set.outline];
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

  // Sizing and stroke props are the adapter's business — the libraries disagree
  // (Lucide `size`/`strokeWidth`, Tabler `size`/`stroke`, Heroicons
  // `width`/`height`/`strokeWidth`). A directly-supplied component has no
  // adapter, so it gets the Lucide-shaped props it most likely expects.
  const svgProps: Record<string, unknown> = set
    ? set.svgProps(size, effectiveStroke)
    : { size, ...(effectiveStroke !== undefined ? { strokeWidth: effectiveStroke } : {}) };

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
