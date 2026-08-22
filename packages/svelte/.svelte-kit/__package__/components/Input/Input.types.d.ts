import type { HTMLInputAttributes } from "svelte/elements";
import type { ControlSize } from "@ui-organized/core";
import type { ArkForwardable } from "../../types.js";
export interface InputProps extends ArkForwardable<Omit<HTMLInputAttributes, "size" | "class">> {
    /** Accessible label text rendered above the control. */
    label?: string;
    /** Helper text rendered below the control. Hidden when an error is shown. */
    helperText?: string;
    /**
     * Error state. Pass a string to show an error message.
     * Pass `true` to mark the field invalid without a message.
     */
    error?: string | boolean;
    /** Size variant. Defaults to 'md'. */
    size?: ControlSize;
    class?: string;
    /** The control's value. Bindable: `bind:value`. */
    value?: string | number | null;
}
//# sourceMappingURL=Input.types.d.ts.map