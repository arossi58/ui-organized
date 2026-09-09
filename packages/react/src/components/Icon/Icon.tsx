import { clsx } from "clsx";
import {
  resolveIconComponent,
  resolveIconStroke,
  resolveIconSvgProps,
} from "@ui-organized/core";
import { useIconConfig } from "../../context/IconContext.js";
import { getIconSet, registeredLibraries, type IconSet } from "../../icons/registry.js";
import { warnMissingIconSet } from "./warnMissingIconSet.js";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconProps } from "./Icon.types.js";
import "@ui-organized/core/components/Icon/Icon.css";

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

  const IconComponent = supplied ?? resolveIconComponent(set, name as CanonicalIconName, style);
  if (!IconComponent) return null;

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
