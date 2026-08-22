import type { Snippet } from "svelte";
/** Props for the app-level provider. */
export interface ToastProviderProps {
    children?: Snippet;
}
/** Semantic status driving a toast's accent color and icon. Set via `add({ type })`. */
export type ToastStatus = "info" | "success" | "warning" | "error";
/** Options accepted by `useToastManager().add(...)`. */
export interface ToastOptions {
    title?: string;
    description?: string;
    /** Status (`info`/`success`/`warning`/`error`) — drives the accent + icon. */
    type?: string;
    /** Auto-dismiss after this many ms. */
    duration?: number;
    /** An inline action button (e.g. "Undo"). */
    actionProps?: {
        children?: string;
        onClick?: () => void;
    };
}
//# sourceMappingURL=Toast.types.d.ts.map