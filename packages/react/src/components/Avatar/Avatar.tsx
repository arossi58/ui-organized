import { Avatar as ArkAvatar } from "@ark-ui/react";
import { clsx } from "clsx";
import { AVATAR_BADGE_ICON_SIZE, AVATAR_STATUS_LABEL, avatarStyles, initials } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import type { AvatarProps } from "./Avatar.types.js";
import "@ui-organized/core/components/Avatar/Avatar.css";
import { glyph } from "../../icons/glyph.js";

const ICON_SIZE: Record<NonNullable<AvatarProps["size"]>, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export function Avatar({
  src,
  alt,
  name,
  fallback,
  size = "md",
  shape,
  status,
  statusLabel,
  verified = false,
  verifiedLabel = "Verified",
  className,
  ...props
}: AvatarProps) {
  const derived =
    fallback ??
    (name ? initials(name) : <Icon name={glyph("user")} size={ICON_SIZE[size]} />);

  return (
    <ArkAvatar.Root
      className={clsx(avatarStyles({ size, shape }), className)}
      {...props}
    >
      {src && (
        <ArkAvatar.Image
          src={src}
          alt={alt ?? name}
          className="avatar__image"
        />
      )}
      <ArkAvatar.Fallback className="avatar__fallback">
        {derived}
      </ArkAvatar.Fallback>
      {status && (
        <span
          className="avatar__status"
          data-status={status}
          role="img"
          aria-label={statusLabel ?? AVATAR_STATUS_LABEL[status]}
        />
      )}
      {verified && (
        <span className="avatar__badge" role="img" aria-label={verifiedLabel}>
          <Icon name={glyph("check")} size={AVATAR_BADGE_ICON_SIZE[size]} />
        </span>
      )}
    </ArkAvatar.Root>
  );
}
