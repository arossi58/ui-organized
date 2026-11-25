import { clsx } from "clsx";
import {
  TAG_GROUP_ICON_SIZE,
  TAG_GROUP_TAG_SIZE,
  TAG_GROUP_TEXT_CLASS,
  tagGroupStyles,
} from "@ui-organized/core";
import { Icon } from "../Icon/Icon.js";
import { Tag } from "../Tag/Tag.js";
import { glyph } from "../../icons/glyph.js";
import type { TagGroupProps } from "./TagGroup.types.js";
import "@ui-organized/core/components/TagGroup/TagGroup.css";

/**
 * The announcement pill: a short tag and a message in one pill, "New ▸ We've
 * shipped dark mode". With `href` the whole pill is one link.
 */
export function TagGroup({
  tag,
  variant = "brand",
  size = "md",
  tagPosition = "leading",
  href,
  target,
  rel,
  icon,
  className,
  children,
  ...props
}: TagGroupProps) {
  const inner = (
    <Tag variant={variant} size={TAG_GROUP_TAG_SIZE[size]} shape="pill" className="tag-group__tag">
      {tag}
    </Tag>
  );
  const trailingIcon = icon ?? (href !== undefined ? glyph("chevron-right") : undefined);
  const classes = clsx(tagGroupStyles({ variant, size, tagPosition }), className);
  const content = (
    <>
      {tagPosition === "leading" && inner}
      <span className={clsx("tag-group__message", TAG_GROUP_TEXT_CLASS[size])}>{children}</span>
      {tagPosition === "trailing" && inner}
      {trailingIcon && <Icon name={trailingIcon} size={TAG_GROUP_ICON_SIZE[size]} className="tag-group__icon" />}
    </>
  );

  if (href !== undefined) {
    return (
      <a className={classes} href={href} target={target} rel={rel} {...props}>
        {content}
      </a>
    );
  }
  return (
    <span className={classes} {...props}>
      {content}
    </span>
  );
}
