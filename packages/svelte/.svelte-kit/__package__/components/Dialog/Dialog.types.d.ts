import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { ArkForwardable } from "../../types.js";
/** Props handed to an `asChild` snippet. Mirrors Ark's own `PropsFn`. */
export type DialogPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;
export interface DialogProps {
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
interface TriggerLike extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
    class?: string;
    children?: Snippet;
    asChild?: Snippet<[DialogPropsFn]>;
}
export type DialogTriggerProps = TriggerLike;
export type DialogCloseProps = TriggerLike;
export interface DialogContentProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    /** Width preset. Defaults to 'md'. */
    size?: "sm" | "md" | "lg" | "fullscreen";
    /** Render a close (x) button in the top-right corner. Defaults to true. */
    showClose?: boolean;
    /** Portal container. Defaults to document.body. */
    container?: HTMLElement | null;
    class?: string;
    children?: Snippet;
}
export interface DialogTitleProps extends ArkForwardable<Omit<HTMLAttributes<HTMLHeadingElement>, "class">> {
    class?: string;
    children?: Snippet;
}
export interface DialogDescriptionProps extends ArkForwardable<Omit<HTMLAttributes<HTMLParagraphElement>, "class">> {
    class?: string;
    children?: Snippet;
}
export interface DialogFooterProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
    class?: string;
    children?: Snippet;
}
export {};
//# sourceMappingURL=Dialog.types.d.ts.map