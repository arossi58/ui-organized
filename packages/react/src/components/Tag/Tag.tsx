import { clsx } from "clsx";
import { Icon } from "../Icon/Icon.js";
import { resolveTagAppearance, tagStyles } from "@ui-organized/core";
import { glyph } from "../../icons/glyph.js";
import type { TagProps } from "./Tag.types.js";
import "@ui-organized/core/components/Tag/Tag.css";

/** Icons render at 16px across every tag size. */
const ICON_SIZE = 16;
/** The remove glyph is smaller than a content icon, so it reads as a control beside the label. */
const REMOVE_ICON_SIZE = 12;

export function Tag({
  variant,
  size,
  appearance,
  emphasized,
  shape,
  dot = false,
  icon,
  iconPosition = "left",
  onRemove,
  removeLabel,
  className,
  children,
  ...props
}: TagProps) {
  const iconEl = icon ? (
    <Icon name={icon} size={ICON_SIZE} className="tag__icon" />
  ) : null;

  return (
    <span
      className={clsx(
        tagStyles({ variant, size, appearance: resolveTagAppearance(appearance, emphasized), shape }),
        className
      )}
      {...props}
    >
      {dot && <span className="tag__dot" aria-hidden="true" />}
      {iconPosition === "left" && iconEl}
      <span className="tag__label">{children}</span>
      {iconPosition === "right" && iconEl}
      {onRemove && (
        <button type="button" className="tag__remove" aria-label={removeLabel} onClick={onRemove}>
          <Icon name={glyph("close")} size={REMOVE_ICON_SIZE} />
        </button>
      )}
    </span>
  );
}
