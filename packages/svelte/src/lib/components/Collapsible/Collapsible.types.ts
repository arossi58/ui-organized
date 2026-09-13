import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";

/**
 * Props handed to an `asChild` snippet, as a function to spread at the use site.
 *
 * Mirrors Ark's own `PropsFn`, which it does not re-export from its entry point.
 * Declaring it structurally keeps the snippet signature assignable to Ark's
 * while leaving this package's public types free of Ark internals. The two
 * spellings differ only in the element being projected onto, and each has to
 * match Ark's exactly — a snippet parameter is checked contravariantly, so a
 * single widened type would not be assignable to either.
 */
export type CollapsibleTriggerPropsFn = (
  props?: HTMLButtonAttributes,
) => HTMLAttributes<HTMLElement>;

export type CollapsibleContentPropsFn = (
  props?: HTMLAttributes<HTMLDivElement>,
) => HTMLAttributes<HTMLElement>;

/**
 * Root of a single disclosure section. Controlled via `bind:open` (or
 * `open` + `onOpenChange`), or uncontrolled via `defaultOpen`.
 */
export interface CollapsibleProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class" | "dir">> {
  /** Whether the panel is open. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Fired with the next open state whenever it changes. */
  onOpenChange?: (open: boolean) => void;
  /** Disable the trigger and prevent toggling. */
  disabled?: boolean;
  class?: string;
  children?: Snippet;
}

export interface CollapsibleTriggerProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
  /** Project the trigger onto a custom element instead of rendering a button. */
  asChild?: Snippet<[CollapsibleTriggerPropsFn]>;
}

export interface CollapsibleContentProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  class?: string;
  children?: Snippet;
  /** Project the panel onto a custom element instead of rendering a div. */
  asChild?: Snippet<[CollapsibleContentPropsFn]>;
}
