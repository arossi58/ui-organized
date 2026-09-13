import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { SheetVariants } from "@ui-organized/core";
import type { ArkForwardable } from "../../types.js";

/** Props handed to an `asChild` snippet. Mirrors Ark's own `PropsFn`. */
export type SheetPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;

export interface SheetProps {
  /** Open state. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Trap focus and block outside interaction while open. Defaults to true. */
  modal?: boolean;
  children?: Snippet;
}

/*
 * Trigger and Close declare their props in full rather than sharing a private
 * base. A base that is not itself exported cannot be named in the generated
 * `.d.ts`, and svelte-package answers that by emitting no declaration file for
 * the component at all — so the part ships untyped.
 */

export interface SheetTriggerProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
  /** Project the trigger onto a custom element instead of rendering a button. */
  asChild?: Snippet<[SheetPropsFn]>;
}

export interface SheetCloseProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
  /** Project the close control onto a custom element. */
  asChild?: Snippet<[SheetPropsFn]>;
}

export interface SheetContentProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  /** Edge the panel slides in from. Defaults to 'right'. */
  side?: SheetVariants["side"];
  /** Panel extent (width for left/right, height for top/bottom). Defaults to 'md'. */
  size?: SheetVariants["size"];
  /** Render a close (x) button in the top-right corner. Defaults to true. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
  children?: Snippet;
}

export interface SheetTitleProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLHeadingElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface SheetDescriptionProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLParagraphElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface SheetFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  class?: string;
  children?: Snippet;
}
