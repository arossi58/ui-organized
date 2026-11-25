import { clsx } from "clsx";
import {
  AVATAR_LABEL_TEXT_CLASS,
  AVATAR_STATUS_LABEL,
  avatarLabelAnnouncement,
  avatarLabelStyles,
} from "@ui-organized/core";
import { Avatar } from "../Avatar/index.js";
import type { AvatarLabelProps } from "./AvatarLabel.types.js";
import "@ui-organized/core/components/AvatarLabel/AvatarLabel.css";

/**
 * An avatar with a name and a line of supporting text beside it. The avatar is
 * hidden from assistive technology, because the name says the same thing; a
 * status or verified badge is announced after the name instead.
 */
export function AvatarLabel({
  name,
  description,
  src,
  fallback,
  size = "md",
  shape,
  status,
  statusLabel,
  verified = false,
  verifiedLabel,
  className,
  ...props
}: AvatarLabelProps) {
  const text = AVATAR_LABEL_TEXT_CLASS[size];
  const announcement = avatarLabelAnnouncement({
    statusLabel: status ? (statusLabel ?? AVATAR_STATUS_LABEL[status]) : undefined,
    verified,
    verifiedLabel,
  });
  return (
    <div className={clsx(avatarLabelStyles({ size }), className)} {...props}>
      <Avatar
        aria-hidden="true"
        size={size}
        shape={shape}
        src={src}
        name={name}
        alt=""
        fallback={fallback}
        status={status}
        statusLabel={statusLabel}
        verified={verified}
        verifiedLabel={verifiedLabel}
      />
      <div className="avatar-label__text">
        <span className={clsx("avatar-label__name", text.name)}>{name}</span>
        {announcement && <span className="avatar-label__sr">{`, ${announcement}`}</span>}
        {description != null && (
          <span className={clsx("avatar-label__description", text.description)}>{description}</span>
        )}
      </div>
    </div>
  );
}
