import { Avatar as ArkAvatar } from "@ark-ui/react";
import { clsx } from "clsx";
import { avatarStyles, initials } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import type { AvatarProps } from "./Avatar.types.js";
import "@ui-organized/core/components/Avatar/Avatar.css";

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
  className,
  ...props
}: AvatarProps) {
  const derived =
    fallback ??
    (name ? initials(name) : <Icon name="user" size={ICON_SIZE[size]} />);

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
    </ArkAvatar.Root>
  );
}
