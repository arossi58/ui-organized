import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";

/** Props handed to an `asChild` snippet. Mirrors Ark's own `PropsFn`. */
export type DrawerPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;

export interface DrawerProps {
  /** Open state. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes, including a swipe that closes it. */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and block outside interaction while open. Defaults to true. */
  modal?: boolean;
  children?: Snippet;
}

/*
 * Trigger and Close declare their props in full rather than sharing a private
 * base, for the reason Sheet.types.ts gives: an unexported base costs the part
 * its declaration file.
 */

export interface DrawerTriggerProps extends ArkForwardable<
  Omit<HTMLButtonAttributes, "class" | "value">
> {
  class?: string;
  children?: Snippet;
  /** Project the trigger onto a custom element instead of rendering a button. */
  asChild?: Snippet<[DrawerPropsFn]>;
}

export interface DrawerCloseProps extends ArkForwardable<
  Omit<HTMLButtonAttributes, "class" | "value">
> {
  class?: string;
  children?: Snippet;
  /** Project the close control onto a custom element. */
  asChild?: Snippet<[DrawerPropsFn]>;
}

export interface DrawerContentProps extends ArkForwardable<
  Omit<HTMLAttributes<HTMLDivElement>, "class" | "draggable">
> {
  /** Whether a press on the content can drag the panel. Defaults to true. The grabber always drags. */
  draggable?: boolean;
  /** The handle along the top edge, which always drags. Defaults to true. */
  showGrabber?: boolean;
  /** A close (x) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
  children?: Snippet;
}

export interface DrawerTitleProps extends ArkForwardable<
  Omit<HTMLAttributes<HTMLHeadingElement>, "class">
> {
  class?: string;
  children?: Snippet;
}

export interface DrawerDescriptionProps extends ArkForwardable<
  Omit<HTMLAttributes<HTMLDivElement>, "class">
> {
  class?: string;
  children?: Snippet;
}

export interface DrawerFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  class?: string;
  children?: Snippet;
}
