import type { Snippet } from "svelte";
import type { ControlSize } from "@ui-organized/core";
export interface AccordionItem {
    /** Unique value identifying this item. */
    value: string | number;
    /** Header label shown in the trigger. A string, or a snippet. */
    title: string | Snippet;
    /** Panel content revealed when the item is open. */
    content: string | Snippet;
    /** Whether this item is disabled. */
    disabled?: boolean;
}
export interface AccordionProps {
    /** Item definitions including titles and panel content. */
    items: AccordionItem[];
    /** Whether multiple panels can be open at once. Defaults to true. */
    multiple?: boolean;
    /** Open item values. Bindable: `bind:value`. */
    value?: (string | number)[];
    /** Initial open item values for uncontrolled usage. */
    defaultValue?: (string | number)[];
    /** Callback fired when the set of open items changes. */
    onValueChange?: (value: (string | number)[]) => void;
    /** Whether the entire accordion is disabled. */
    disabled?: boolean;
    /** Visual variant. Defaults to 'default'. */
    variant?: "default" | "bordered" | "separated";
    /** Sizing of triggers and panels. Defaults to 'md'. */
    size?: ControlSize;
    class?: string;
}
//# sourceMappingURL=Accordion.types.d.ts.map