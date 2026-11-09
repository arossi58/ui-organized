import { clsx } from "clsx";
import {
  resolveIconStroke,
  resolveIconSvgProps,
  resolveSystemGlyph,
} from "@ui-organized/core";
import { useIconConfig } from "../../context/IconContext.js";
import { glyphOf } from "../../icons/glyph.js";
import {
  getIcon,
  getIconSet,
  registeredLibraries,
  registeredNames,
  type IconSet,
} from "../../icons/registry.js";
import { warnMissingIcon, warnMissingIconSet } from "./warnMissingIconSet.js";
import type { IconProps } from "./Icon.types.js";
import "@ui-organized/core/components/Icon/Icon.css";

/**
 * Foundational Icon component — the single interface for rendering icons.
 *
 * Reads the active library, style, and stroke adjustment setting from the
 * nearest `IconProvider`, looks the name up among the icons registered for that
 * library, and renders it at the requested size with optical stroke correction
 * when enabled.
 *
 * Names are the library's own (`x` in Lucide, `x-mark` in Heroicons), and only
 * the icons you register reach the bundle — see `../../icons/registry.ts` for
 * why the package imports none of the icon libraries itself:
 *
 * ```ts
 * import { registerIcons } from "@ui-organized/react/icons/lucide";
 * import { Camera, Rocket } from "lucide-react";
 * registerIcons({ Camera, Rocket });   // <Icon name="camera" />
 * ```
 *
 * Components never import from lucide-react, @tabler/icons-react or
 * @heroicons/react directly — they always go through this component.
 */
export function Icon({ name, size = 24, label, className }: IconProps) {
  const { library, style, strokeAdjustment, baseSize, baseStroke, icons } = useIconConfig();

  // A directly-supplied component is used as-is — it needs no registration and
  // no registered set. Library icons are `forwardRef` objects rather than plain
  // functions, so this tests for "not a string" rather than "is a function". The
  // exception is one of the components' own glyphs, which stands in for
  // whichever cut the active library has.
  const glyph = typeof name !== "string" ? glyphOf(name) : undefined;
  const supplied = typeof name !== "string" && !glyph ? name : undefined;

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

  const IconComponent =
    supplied ??
    (glyph
      ? resolveSystemGlyph(set, glyph, style)
      : getIcon(set!.library, name as string, style));
  if (!IconComponent) {
    if (typeof name === "string") {
      warnMissingIcon(set!.library, name, registeredNames(set!.library));
    }
    return null;
  }

  const svgProps = resolveIconSvgProps(
    set,
    size,
    resolveIconStroke({ style, strokeAdjustment, size, baseStroke, baseSize }),
  );

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
