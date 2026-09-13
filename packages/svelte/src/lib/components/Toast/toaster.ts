/**
 * The toaster instance and the imperative surface over it.
 *
 * Ark uses a standalone toaster rather than a framework context manager, so one
 * module-level instance backs both the rendered region and the API — the same
 * shape the React package has, and the reason `useToastManager()` there returns
 * a static object rather than holding any state.
 *
 * It lives in a plain `.ts` file, separate from the provider component, so a
 * caller can import the manager without importing a component.
 */
import { createToaster } from "@ark-ui/svelte";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ToastOptions, ToastStatus } from "./Toast.types.js";

export const toaster = createToaster({
  placement: "bottom-end",
  overlap: false,
  gap: 8,
  duration: 5000,
});

export const STATUS_ICON: Record<ToastStatus, CanonicalIconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  error: "alert-circle",
};

/** Map a toast's free-form `type` to one of our four statuses. */
export function resolveStatus(type: string | undefined): ToastStatus {
  return type === "success" || type === "warning" || type === "error" ? type : "info";
}

/**
 * The manager surface: `add`/`close`/`update` over Ark's
 * `create`/`dismiss`/`update`, with `actionProps` mapped to Ark's `action`.
 * Kept identical to the React package so the same code reads the same way in
 * either.
 */
const manager = {
  add(options: ToastOptions): string {
    const { actionProps, ...rest } = options;
    return toaster.create({
      ...rest,
      action: actionProps?.children
        ? { label: actionProps.children, onClick: actionProps.onClick ?? (() => {}) }
        : undefined,
    });
  },
  close(id: string) {
    toaster.dismiss(id);
  },
  update(id: string, options: ToastOptions) {
    const { actionProps: _actionProps, ...rest } = options;
    toaster.update(id, rest);
  },
};

/**
 * Returns `{ add, close, update }` for imperative toasts.
 *
 * Named `useToastManager` to match the React package, though it is not a hook
 * and can be called anywhere — there is no state behind it.
 */
export function useToastManager() {
  return manager;
}
