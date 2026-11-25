/** One person or entity in an AvatarGroup. */
export interface AvatarGroupItem {
  src?: string;
  /** Used for initials and as the image's alt text. */
  name?: string;
  alt?: string;
  /** Text in place of the initials. */
  fallback?: string;
}

export interface AvatarGroupProps {
  /** The avatars, in order. */
  items: AvatarGroupItem[];
  /** The most avatars to show, counting the `+N` as one. Shows every item when omitted. */
  max?: number;
  /** Size of every avatar. Defaults to 'md'. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape of every avatar. Defaults to 'circle'. */
  shape?: "circle" | "rounded" | "square";
  /** The group's accessible name: "Project members". */
  label?: string;
  /** The `+N` avatar's accessible name. Defaults to "N more". */
  moreLabel?: (count: number) => string;
}
