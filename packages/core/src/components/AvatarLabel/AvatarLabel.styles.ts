import { cva, type VariantProps } from "class-variance-authority";

/** An avatar with a name and a line of supporting text beside it. */
export const avatarLabelStyles = cva("avatar-label", {
  variants: {
    size: {
      sm: "avatar-label--sm",
      md: "avatar-label--md",
      lg: "avatar-label--lg",
      xl: "avatar-label--xl",
    },
  },
  defaultVariants: { size: "md" },
});

export type AvatarLabelVariants = VariantProps<typeof avatarLabelStyles>;

export type AvatarLabelSize = "sm" | "md" | "lg" | "xl";

/** The type class each line takes, per size; the avatar is the same size step. */
export const AVATAR_LABEL_TEXT_CLASS: Record<AvatarLabelSize, { name: string; description: string }> = {
  sm: { name: "text-default-body-medium", description: "text-default-body-small" },
  md: { name: "text-default-body-medium", description: "text-default-body-medium" },
  lg: { name: "text-default-body-large", description: "text-default-body-medium" },
  xl: { name: "text-default-heading-small", description: "text-default-body-large" },
};

/**
 * The status and verified badges as words, for the visually hidden line that
 * stands in for the hidden avatar: "Online, Verified".
 */
export function avatarLabelAnnouncement(parts: { statusLabel?: string; verified?: boolean; verifiedLabel?: string }): string {
  return [parts.statusLabel, parts.verified ? (parts.verifiedLabel ?? "Verified") : undefined]
    .filter(Boolean)
    .join(", ");
}
