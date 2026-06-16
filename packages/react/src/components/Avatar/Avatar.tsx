import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { clsx } from "clsx";
import { avatarStyles } from "./Avatar.styles.js";
import { Icon } from "../Icon/index.js";
import type { AvatarProps } from "./Avatar.types.js";
import "./Avatar.css";

const ICON_SIZE: Record<NonNullable<AvatarProps["size"]>, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

/** Derive up-to-two-letter initials from a full name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0]![0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]![0] : "";
  return (first + last).toUpperCase();
}

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
    <BaseAvatar.Root
      className={clsx(avatarStyles({ size, shape }), className)}
      {...props}
    >
      {src && (
        <BaseAvatar.Image
          src={src}
          alt={alt ?? name}
          className="avatar__image"
        />
      )}
      <BaseAvatar.Fallback className="avatar__fallback">
        {derived}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
