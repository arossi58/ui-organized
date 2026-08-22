import type { CanonicalIconName } from "@ui-organized/utils";
import type { ToastOptions, ToastStatus } from "./Toast.types.js";
export declare const toaster: import("@ark-ui/svelte").CreateToasterReturn<any>;
export declare const STATUS_ICON: Record<ToastStatus, CanonicalIconName>;
/** Map a toast's free-form `type` to one of our four statuses. */
export declare function resolveStatus(type: string | undefined): ToastStatus;
/**
 * Returns `{ add, close, update }` for imperative toasts.
 *
 * Named `useToastManager` to match the React package, though it is not a hook
 * and can be called anywhere — there is no state behind it.
 */
export declare function useToastManager(): {
    add(options: ToastOptions): string;
    close(id: string): void;
    update(id: string, options: ToastOptions): void;
};
//# sourceMappingURL=toaster.d.ts.map