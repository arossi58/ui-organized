import { Toast as BaseToast } from "@base-ui-components/react/toast";
import { Icon } from "../Icon/index.js";
import type { CanonicalIconName } from "@ui-organized/utils";
import { toastStyles } from "./Toast.styles.js";
import type { ToastProviderProps, ToastStatus } from "./Toast.types.js";
import "./Toast.css";

const STATUS_ICON: Record<ToastStatus, CanonicalIconName> = {
  info:    "info",
  success: "check-circle",
  warning: "alert-triangle",
  error:   "alert-circle",
};

/** Map a toast's free-form `type` to one of our four statuses. */
function resolveStatus(type: string | undefined): ToastStatus {
  return type === "success" || type === "warning" || type === "error" ? type : "info";
}

/** Renders the live toast list from the manager. Rendered inside the viewport. */
function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => {
        const status = resolveStatus(toast.type);
        return (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            className={toastStyles({ status })}
            swipeDirection={["right", "down"]}
          >
            <span className="toast__icon">
              <Icon name={STATUS_ICON[status]} size={18} />
            </span>
            <div className="toast__content">
              <BaseToast.Title className="toast__title" />
              <BaseToast.Description className="toast__description" />
            </div>
            {toast.actionProps && <BaseToast.Action className="toast__action" />}
            <BaseToast.Close className="toast__close" aria-label="Dismiss">
              <Icon name="close" size={16} />
            </BaseToast.Close>
          </BaseToast.Root>
        );
      })}
    </>
  );
}

/**
 * Wrap your app once. Trigger toasts imperatively with the manager:
 *
 * ```tsx
 * const toast = useToastManager();
 * toast.add({ title: "Saved", description: "Your changes are live.", type: "success" });
 * ```
 */
export function ToastProvider({ children, ...props }: ToastProviderProps) {
  return (
    <BaseToast.Provider {...props}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="toast__viewport">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

/** Hook returning `{ add, close, update, promise, toasts }` for imperative toasts. */
export const useToastManager = BaseToast.useToastManager;
