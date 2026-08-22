import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ArkForwardable } from "../../types.js";
export type MenuSide = "top" | "right" | "bottom" | "left";
export type MenuAlign = "start" | "center" | "end";
/** Props handed to an `asChild` snippet. Mirrors Ark's own `PropsFn`. */
export type MenuPropsFn = (props?: HTMLButtonAttributes) => HTMLAttributes<HTMLElement>;
export interface MenuProps {
    /** Open state. Bindable: `bind:open`. */
    open?: boolean;
    /** Initial open state for uncontrolled usage. */
    defaultOpen?: boolean;
    /** Callback fired when the open state changes. */
    onOpenChange?: (open: boolean) => void;
    children?: Snippet;
}
export interface MenuTriggerProps extends ArkForwardable<Omit<HTMLButtonAttributes, "class" | "value">> {
    class?: string;
    children?: Snippet;
    /** Project the trigger onto a custom element instead of rendering a button. */
    asChild?: Snippet<[MenuPropsFn]>;
}
export interface MenuContentProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    /** Side of the trigger to position against. Defaults to 'bottom'. */
    side?: MenuSide;
    /** Alignment along the chosen side. Defaults to 'start'. */
    align?: MenuAlign;
    /** Gap between trigger and popup, in px. Defaults to 4. */
    sideOffset?: number;
    /** Offset along the alignment axis, in px. */
    alignOffset?: number;
    /** Portal container. Defaults to document.body. */
    container?: HTMLElement | null;
    class?: string;
    children?: Snippet;
}
export interface MenuItemProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    /** Icon rendered before the label. */
    icon?: CanonicalIconName;
    /** Renders the item in the destructive colour. */
    destructive?: boolean;
    /** Stable value for the item. Generated when omitted. */
    value?: string;
    onSelect?: () => void;
    class?: string;
    children?: Snippet;
}
export interface MenuSeparatorProps {
    class?: string;
}
interface GroupLike extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    class?: string;
    children?: Snippet;
}
export type MenuGroupProps = GroupLike;
export type MenuGroupLabelProps = GroupLike;
export interface MenuRadioGroupProps {
    value?: string;
    onValueChange?: (value: string) => void;
    children?: Snippet;
}
export interface MenuCheckboxItemProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    value?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    class?: string;
    children?: Snippet;
}
export interface MenuRadioItemProps extends ArkForwardable<Omit<HTMLAttributes<HTMLDivElement>, "class">> {
    value: string;
    class?: string;
    children?: Snippet;
}
export {};
//# sourceMappingURL=Menu.types.d.ts.map