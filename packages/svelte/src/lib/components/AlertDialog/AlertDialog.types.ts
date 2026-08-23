import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { DialogVariants } from "@ui-organized/core";
import type { ArkForwardable } from "../../types.js";

/** Props handed to an `asChild` snippet. Mirrors Ark's own `PropsFn`. */
export type AlertDialogPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;

export interface AlertDialogProps {
  /**
   * Open state. Bindable: `bind:open`.
   *
   * There is no `modal` prop, unlike Dialog: an alert dialog that could be
   * dismissed by clicking past it would defeat the point of asking.
   */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: Snippet;
}

/*
 * The three button-shaped parts declare their props in full rather than sharing
 * a private base. A base that is not itself exported cannot be named in the
 * generated `.d.ts`, and svelte-package answers that by emitting no declaration
 * file for the component at all — so the part ships untyped.
 */

export interface AlertDialogTriggerProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
  /** Project the trigger onto a custom element instead of rendering a button. */
  asChild?: Snippet<[AlertDialogPropsFn]>;
}

export interface AlertDialogCancelProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  class?: string;
  children?: Snippet;
}

export interface AlertDialogConfirmProps
  extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
  /** Button intent. Defaults to 'primary'. Use 'destructive' for dangerous actions. */
  intent?: "primary" | "destructive";
  class?: string;
  children?: Snippet;
}

export interface AlertDialogContentProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  /** Width preset. Defaults to 'sm'. */
  size?: DialogVariants["size"];
  /** Render a close (x) button. Defaults to false — confirm with the actions. */
  showClose?: boolean;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
  children?: Snippet;
}

export interface AlertDialogTitleProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLHeadingElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface AlertDialogDescriptionProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLParagraphElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface AlertDialogFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  class?: string;
  children?: Snippet;
}
