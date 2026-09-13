import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";

export type HoverCardSide = "top" | "right" | "bottom" | "left";
export type HoverCardAlign = "start" | "center" | "end";

/** Props handed to an `asChild` snippet. Mirrors Ark's own `PropsFn`. */
export type HoverCardPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;

export interface HoverCardProps {
  /** Open state. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Delay before opening on hover, in ms. */
  openDelay?: number;
  /** Delay before closing on leave, in ms. */
  closeDelay?: number;
  children?: Snippet;
}

export interface HoverCardTriggerProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
  /** Project the trigger onto a custom element — which is what a link wants. */
  asChild?: Snippet<[HoverCardPropsFn]>;
}

export interface HoverCardContentProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: HoverCardSide;
  /** Alignment along the chosen side. Defaults to 'center'. */
  align?: HoverCardAlign;
  /** Gap between trigger and card, in px. Defaults to 8. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
  children?: Snippet;
}
