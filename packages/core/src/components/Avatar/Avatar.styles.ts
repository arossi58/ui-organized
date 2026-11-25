import { cva, type VariantProps } from "class-variance-authority";

export const avatarStyles = cva("avatar", {
  variants: {
    size: {
      xs: "avatar--xs",
      sm: "avatar--sm",
      md: "avatar--md",
      lg: "avatar--lg",
      xl: "avatar--xl",
    },
    shape: {
      circle:  "avatar--circle",
      rounded: "avatar--rounded",
      square:  "avatar--square",
    },
  },
  defaultVariants: {
    size:  "md",
    shape: "circle",
  },
});

export type AvatarVariants = VariantProps<typeof avatarStyles>;

export type AvatarStatus = "online" | "away" | "busy" | "offline";

/** The status dot's default accessible name, per status. */
export const AVATAR_STATUS_LABEL: Record<AvatarStatus, string> = {
  online: "Online",
  away: "Away",
  busy: "Busy",
  offline: "Offline",
};

/** The verified badge's check (px), per avatar size; the badge is 10–20 px. */
export const AVATAR_BADGE_ICON_SIZE: Record<"xs" | "sm" | "md" | "lg" | "xl", number> = {
  xs: 8,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
};
