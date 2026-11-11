import { clsx } from "clsx";
import { alertStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import type { AlertProps } from "./Alert.types.js";
import type { SystemGlyph } from "@ui-organized/core";
import "@ui-organized/core/components/Alert/Alert.css";
import { glyph } from "../../icons/glyph.js";

const VARIANT_ICONS: Record<NonNullable<AlertProps["variant"]>, SystemGlyph> = {
  info:    "info",
  success: "check-circle",
  warning: "alert-triangle",
  error:   "alert-circle",
};

export function Alert({ variant = "info", title, children, onDismiss, className }: AlertProps) {
  return (
    <div role="alert" className={clsx(alertStyles({ variant }), className)}>
      <span className="alert__icon">
        <Icon name={glyph(VARIANT_ICONS[variant])} size={20} />
      </span>
      <div className="alert__body">
        {title && <div className="alert__title text-strong-body-medium">{title}</div>}
        <div className="alert__message text-default-body-medium">{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="alert__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss alert"
        >
          <Icon name={glyph("close")} size={20} />
        </button>
      )}
    </div>
  );
}
