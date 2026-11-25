import { cva, type VariantProps } from "class-variance-authority";

/** Overlapping avatars, each on a ring, with a `+N` for the ones past `max`. */
export const avatarGroupStyles = cva("avatar-group", {
  variants: {
    size: {
      xs: "avatar-group--xs",
      sm: "avatar-group--sm",
      md: "avatar-group--md",
      lg: "avatar-group--lg",
      xl: "avatar-group--xl",
    },
  },
  defaultVariants: { size: "md" },
});

export type AvatarGroupVariants = VariantProps<typeof avatarGroupStyles>;

/** The avatars a group shows, and how many it folds into `+N`. */
export function splitAvatarGroup<T>(items: readonly T[], max?: number): { shown: T[]; overflow: number } {
  if (max == null || max < 1 || items.length <= max) return { shown: [...items], overflow: 0 };
  // The `+N` takes a slot of its own, so `max` counts it: max 4 of 6 is 3 avatars and +3.
  const shown = items.slice(0, max - 1);
  return { shown, overflow: items.length - shown.length };
}

/** The `+N` avatar's accessible name. */
export const defaultAvatarGroupMoreLabel = (count: number) => `${count} more`;
