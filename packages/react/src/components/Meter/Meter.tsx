import { useId } from "react";
import { clsx } from "clsx";
import { meterStyles } from "./Meter.styles.js";
import type { MeterProps } from "./Meter.types.js";
import "./Meter.css";

// Ark UI has no Meter primitive; Base UI's Meter.Root was a thin role="meter"
// wrapper that emitted the ARIA value attributes, formatted the value, and set
// the fill width. None of that needs a headless machine, so the facade owns the
// accessible markup directly (this also removes the only place a meter touched
// Base UI). Distinct from Progress: a meter shows a static measurement, never
// indeterminate.
export function Meter({
  value,
  min = 0,
  max = 100,
  label,
  showValue = false,
  format,
  variant,
  size,
  className,
  "aria-label": ariaLabel,
}: MeterProps) {
  const showHeader = label != null || showValue;
  const clamped = Math.min(Math.max(value, min), max);
  const percent = max > min ? ((clamped - min) / (max - min)) * 100 : 0;
  const formatted = new Intl.NumberFormat(undefined, format).format(value);
  // `role="meter"` needs an accessible name: the caption when there is one,
  // otherwise whatever the caller passes. A bare number is not a measurement.
  const labelId = useId();

  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={formatted}
      aria-labelledby={label != null ? labelId : undefined}
      aria-label={label == null ? ariaLabel : undefined}
      className={clsx(meterStyles({ variant, size }), className)}
    >
      {showHeader && (
        <div className="meter__header text-default-body-small">
          {label != null && (
            <span className="meter__label" id={labelId}>
              {label}
            </span>
          )}
          {showValue && <span className="meter__value">{formatted}</span>}
        </div>
      )}
      <div className="meter__track">
        <div className="meter__indicator" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
