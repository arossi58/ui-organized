import { clsx } from "clsx";
import { alertStyles } from "./Alert.styles.js";
import { Icon } from "../Icon/index.js";
import type { AlertProps } from "./Alert.types.js";
import type { CanonicalIconName } from "@ui-organized/utils";
import "./Alert.css";

const VARIANT_ICONS: Record<NonNullable<AlertProps["variant"]>, CanonicalIconName> = {
  info:    "info",
  success: "check-circle",
  warning: "alert-triangle",
  error:   "alert-circle",
};

export function Alert({ variant = "info", title, children, onDismiss, className }: AlertProps) {
  return (
    <div role="alert" className={clsx(alertStyles({ variant }), className)}>
      <span className="alert__icon">
        <Icon name={VARIANT_ICONS[variant]} size={18} />
      </span>
      <div className="alert__body">
        {title && <div className="alert__title">{title}</div>}
        <div className="alert__message">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
}
