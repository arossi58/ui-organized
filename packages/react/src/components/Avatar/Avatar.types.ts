import type * as React from "react";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Image source URL. When omitted (or it fails to load) the fallback is shown. */
  src?: string;
  /** Alt text for the image. Falls back to `name`. */
  alt?: string;
  /** Person's name — used to derive initials and as the image alt fallback. */
  name?: string;
  /** Custom fallback content. Overrides the derived initials / user icon. */
  fallback?: React.ReactNode;
  /** Size. Defaults to 'md'. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape. Defaults to 'circle'. */
  shape?: "circle" | "rounded" | "square";
  /** A presence dot at the bottom corner: green, amber, red or grey. */
  status?: "online" | "away" | "busy" | "offline";
  /** The status dot's accessible name. Defaults to the status, capitalised: "Online". */
  statusLabel?: string;
  /** A check badge in the brand colour, for a verified account. */
  verified?: boolean;
  /** The verified badge's accessible name. Defaults to "Verified". */
  verifiedLabel?: string;
}
