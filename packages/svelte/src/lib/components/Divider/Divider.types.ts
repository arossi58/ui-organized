import type { ClassValue, HTMLAttributes } from "svelte/elements";

export interface DividerProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** Orientation of the rule. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
  /** Margin along the cross axis (block when horizontal, inline when vertical). Defaults to 'none'. */
  spacing?: "none" | "sm" | "md" | "lg";
  /**
   * Merged after the recipe's classes. A `ClassValue`, like any element's
   * `class`, not a string: this renders a plain element, and Menu's separators
   * project Ark's `asChild` props onto it, which arrive in Svelte's own shapes.
   * See ../../types.ts.
   */
  class?: ClassValue | null;
}
