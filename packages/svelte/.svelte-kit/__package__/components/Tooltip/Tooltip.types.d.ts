import type { Snippet } from "svelte";
/** Side of the trigger to position the tooltip against. */
export type TooltipSide = "top" | "right" | "bottom" | "left";
/** Alignment along the chosen side. */
export type TooltipAlign = "start" | "center" | "end";
export interface TooltipProps {
    /** Content shown in the tooltip bubble. A string, or a snippet. */
    content: string | Snippet;
    /** The trigger. */
    children: Snippet;
    /** Side of the trigger to position against. Defaults to 'top'. */
    side?: TooltipSide;
    /** Alignment along the chosen side. Defaults to 'center'. */
    align?: TooltipAlign;
    /** Gap between the trigger and bubble, in px. Defaults to 6. */
    sideOffset?: number;
    /** Delay before opening, in ms. Falls back to a wrapping TooltipProvider. */
    delay?: number;
    /** Delay before closing, in ms. Falls back to a wrapping TooltipProvider. */
    closeDelay?: number;
    /** When true, renders the trigger without a tooltip. */
    disabled?: boolean;
    /** Open state. Bindable: `bind:open`. */
    open?: boolean;
    /** Initial open state for uncontrolled usage. */
    defaultOpen?: boolean;
    /** Callback fired when the open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** Portal container. Defaults to document.body. */
    container?: HTMLElement | null;
}
export interface TooltipProviderProps {
    children: Snippet;
    /** Default delay before opening, in ms, for descendant tooltips. */
    delay?: number;
    /** Default delay before closing, in ms, for descendant tooltips. */
    closeDelay?: number;
}
//# sourceMappingURL=Tooltip.types.d.ts.map