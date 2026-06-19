import { Toast, Toaster, createToaster } from "@ark-ui/react";
import { Icon } from "../Icon/index.js";
import type { CanonicalIconName } from "@ui-organized/utils";
import { toastStyles } from "./Toast.styles.js";
import type { ToastProviderProps, ToastOptions, ToastStatus } from "./Toast.types.js";
import "./Toast.css";

// Ark uses a standalone toaster instance (not a React context manager). One
// module-level instance backs both the rendered region and the imperative API.
const toaster = createToaster({
  placement: "bottom-end",
  overlap: false,
  gap: 8,
  duration: 5000,
});

const STATUS_ICON: Record<ToastStatus, CanonicalIconName> = {
  info: "info",
  success: "check-circle",
  warning: "alert-triangle",
  error: "alert-circle",
};

/** Map a toast's free-form `type` to one of our four statuses. */
function resolveStatus(type: string | undefined): ToastStatus {
  return type === "success" || type === "warning" || type === "error" ? type : "info";
}

/**
 * Wrap your app once. Trigger toasts imperatively with the manager:
 *
 * ```tsx
 * const toast = useToastManager();
 * toast.add({ title: "Saved", description: "Your changes are live.", type: "success" });
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster toaster={toaster} className="toast__viewport">
        {(toast) => {
          const status = resolveStatus(toast.type);
          return (
            <Toast.Root key={toast.id} className={toastStyles({ status })}>
              <span className="toast__icon">
                <Icon name={STATUS_ICON[status]} size={18} />
              </span>
              <div className="toast__content">
                <Toast.Title className="toast__title">{toast.title}</Toast.Title>
                <Toast.Description className="toast__description">
                  {toast.description}
                </Toast.Description>
              </div>
              {toast.action && (
                <Toast.ActionTrigger className="toast__action">
                  {toast.action.label}
                </Toast.ActionTrigger>
              )}
              <Toast.CloseTrigger className="toast__close" aria-label="Dismiss">
                <Icon name="close" size={16} />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </Toaster>
    </>
  );
}

// Preserve the Base UI manager surface (`add`/`close`/`update`) over Ark's
// toaster (`create`/`dismiss`/`update`), and map `actionProps` -> Ark `action`.
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
    const { actionProps, ...rest } = options;
    toaster.update(id, rest);
  },
};

/** Hook returning `{ add, close, update }` for imperative toasts. */
export function useToastManager() {
  return manager;
}
