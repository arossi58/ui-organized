import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ArkForwardable } from "../../types.js";

export interface ContextMenuProps {
  /** Open state. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: Snippet;
}

/**
 * The right-click area's props.
 *
 * Typed against `HTMLElement` rather than `HTMLDivElement`, even though a `div`
 * is what renders. They are handed to Ark's own `PropsFn`, which is generic in
 * the *button* it would otherwise have rendered, and an event handler bound to
 * `HTMLDivElement` is not assignable to one bound to `HTMLButtonElement`.
 * `HTMLElement` is assignable to both, so the merge typechecks without the
 * trigger's public API claiming to be a button.
 */
export interface ContextMenuTriggerProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface ContextMenuContentProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  /** Gap from the cursor, in px. Defaults to 4. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** Portal container. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
  children?: Snippet;
}

export interface ContextMenuItemProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  /** Stable value for the item. Generated when omitted. */
  value?: string;
  /** Icon rendered before the label. */
  icon?: CanonicalIconName;
  /** Renders the item in the destructive colour. */
  destructive?: boolean;
  /** Fired when the item is selected (click or keyboard). */
  onSelect?: () => void;
  class?: string;
  children?: Snippet;
}

export interface ContextMenuSeparatorProps {
  class?: string;
}

/*
 * Group and GroupLabel declare their props in full rather than sharing a private
 * base. A base that is not itself exported cannot be named in the generated
 * `.d.ts`, and svelte-package answers that by emitting no declaration file for
 * the component at all — so the part ships untyped.
 */

export interface ContextMenuGroupProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface ContextMenuGroupLabelProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  class?: string;
  children?: Snippet;
}

export interface ContextMenuRadioGroupProps {
  /** Selected value. Bindable: `bind:value`. */
  value?: string;
  onValueChange?: (value: string) => void;
  children?: Snippet;
}

export interface ContextMenuCheckboxItemProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  value?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  class?: string;
  children?: Snippet;
}

export interface ContextMenuRadioItemProps
  extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
  value: string;
  class?: string;
  children?: Snippet;
}
