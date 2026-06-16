import type * as React from "react";
import { Toast as BaseToast } from "@base-ui-components/react/toast";

/** Props for the app-level provider (`timeout`, `limit`, `toastManager`). */
export type ToastProviderProps = React.ComponentProps<typeof BaseToast.Provider>;

/** Semantic status driving a toast's accent color and icon. Set via `add({ type })`. */
export type ToastStatus = "info" | "success" | "warning" | "error";
