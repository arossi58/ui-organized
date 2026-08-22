import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";
export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";
/**
 * Props handed to an `asChild` snippet, as a function to spread at the use site.
 *
 * Mirrors Ark's own `PropsFn`, which it does not re-export from its entry point.
 * Declaring it structurally keeps the snippet signature assignable to Ark's
 * while leaving this package's public types free of Ark internals.
 */
export type PopoverPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;
export interface PopoverProps {
    /** Open state. Bindable: `bind:open`. */
    open?: boolean;
    /** Initial open state for uncontrolled usage. */
    defaultOpen?: boolean;
    /** Callback fired when the open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Trap focus and block outside interaction while open. */
    modal?: boolean;
    children?: Snippet;
}
export interface PopoverTriggerProps extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
    class?: string;
    children?: Snippet;
    /** Project the trigger onto a custom element instead of rendering a button. */
    asChild?: Snippet<[PopoverPropsFn]>;
}
export interface PopoverCloseProps extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
    class?: string;
    children?: Snippet;
    /** Project the close control onto a custom element. */
    asChild?: Snippet<[PopoverPropsFn]>;
}
export interface PopoverContentProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    /** Side of the trigger to position against. Defaults to 'bottom'. */
    side?: PopoverSide;
    /** Alignment along the chosen side. Defaults to 'center'. */
    align?: PopoverAlign;
    /** Gap between trigger and popup, in px. Defaults to 8. */
    sideOffset?: number;
    /** Offset along the alignment axis, in px. */
    alignOffset?: number;
    /** Portal container. Defaults to document.body. */
    container?: HTMLElement | null;
    class?: string;
    children?: Snippet;
}
export interface PopoverTitleProps extends ArkForwardable<Omit<HTMLAttributes<HTMLHeadingElement>, "class">> {
    class?: string;
    children?: Snippet;
}
export interface PopoverDescriptionProps extends ArkForwardable<Omit<HTMLAttributes<HTMLParagraphElement>, "class">> {
    class?: string;
    children?: Snippet;
}
//# sourceMappingURL=Popover.types.d.ts.map