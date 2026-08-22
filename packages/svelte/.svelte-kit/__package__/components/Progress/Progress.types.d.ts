import type { Snippet } from "svelte";
import type { ControlSize } from "@ui-organized/core";
export interface ProgressProps {
    /** Current value. `null` renders an indeterminate bar. Defaults to null. */
    value?: number | null;
    /** Maximum value. Defaults to 100. */
    max?: number;
    /** Optional label rendered above the track. A string, or a snippet. */
    label?: string | Snippet;
    /** Whether to show the formatted value beside the label. Defaults to false. */
    showValue?: boolean;
    /** Color variant. Defaults to 'default'. */
    variant?: "default" | "success" | "warning" | "error";
    /** Track thickness. Defaults to 'md'. */
    size?: ControlSize;
    /**
     * Track geometry. `circular` draws a ring instead of a bar — the same value
     * and states, in the shape that fits beside an avatar or inside a tile.
     * Defaults to 'linear'.
     */
    shape?: "linear" | "circular";
    class?: string;
}
//# sourceMappingURL=Progress.types.d.ts.map