import { clsx } from "clsx";
import { avatarGroupStyles, avatarStyles, defaultAvatarGroupMoreLabel, splitAvatarGroup } from "@ui-organized/core";
import { Avatar } from "../Avatar/index.js";
import type { AvatarGroupProps } from "./AvatarGroup.types.js";
import "@ui-organized/core/components/AvatarGroup/AvatarGroup.css";

/**
 * Overlapping avatars for the people on something, with a `+N` for the rest.
 * Data-driven, as in every library, because Svelte snippets can't be counted.
 */
export function AvatarGroup({
  items,
  max,
  size = "md",
  shape,
  label,
  moreLabel = defaultAvatarGroupMoreLabel,
  className,
  ...props
}: AvatarGroupProps) {
  const { shown, overflow } = splitAvatarGroup(items, max);
  return (
    <div className={clsx(avatarGroupStyles({ size }), className)} role="group" aria-label={label} {...props}>
      {shown.map((item, index) => (
        <Avatar
          key={item.name ?? index}
          size={size}
          shape={shape}
          src={item.src}
          name={item.name}
          alt={item.alt}
          fallback={item.fallback}
        />
      ))}
      {overflow > 0 && (
        <span
          className={clsx(avatarStyles({ size, shape }), "avatar-group__overflow")}
          role="img"
          aria-label={moreLabel(overflow)}
        >
          {`+${overflow}`}
        </span>
      )}
    </div>
  );
}
