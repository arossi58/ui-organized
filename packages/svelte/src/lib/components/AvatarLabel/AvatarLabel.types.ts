import type { HTMLAttributes } from "svelte/elements";

export interface AvatarLabelProps extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> {
  /** The person or entity's name, shown beside the avatar and used for its initials. */
  name: string;
  /** A line of supporting text: an email, a role, a handle. */
  description?: string;
  /** Avatar image source. */
  src?: string;
  /** Text in place of the initials. */
  fallback?: string;
  /** `sm`, `md`, `lg` or `xl`: the avatar's size step, with type to match. Defaults to 'md'. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Avatar shape. Defaults to 'circle'. */
  shape?: "circle" | "rounded" | "square";
  /** A presence dot on the avatar, also announced after the name. */
  status?: "online" | "away" | "busy" | "offline";
  statusLabel?: string;
  /** A verified badge on the avatar, also announced after the name. */
  verified?: boolean;
  verifiedLabel?: string;
  class?: string;
}
