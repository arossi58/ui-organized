import type { ClassValue, HTMLAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

interface CardPartProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /**
   * Merged after the recipe's classes. A `ClassValue`, like any element's
   * `class`, not a string: this renders a plain element, so it can receive an
   * Ark `asChild`'s props, which arrive in Svelte's own shapes. See
   * ../../types.ts.
   */
  class?: ClassValue | null;
  children?: Snippet;
}

export interface CardProps extends CardPartProps {
  /** Visual style variant. Defaults to 'default'. */
  variant?: "default" | "elevated";
  /** Padding size. Defaults to 'md'. */
  padding?: "none" | "sm" | "md" | "lg";
}

export type CardHeaderProps = CardPartProps;
export type CardBodyProps = CardPartProps;
export type CardFooterProps = CardPartProps;
