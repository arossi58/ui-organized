import { Meter as BaseMeter } from "@base-ui-components/react/meter";
import { clsx } from "clsx";
import { meterStyles } from "./Meter.styles.js";
import type { MeterProps } from "./Meter.types.js";
import "./Meter.css";

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
}: MeterProps) {
  const showHeader = label != null || showValue;

  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      format={format}
      className={clsx(meterStyles({ variant, size }), className)}
    >
      {showHeader && (
        <div className="meter__header">
          {label != null && <BaseMeter.Label className="meter__label">{label}</BaseMeter.Label>}
          {showValue && <BaseMeter.Value className="meter__value" />}
        </div>
      )}
      <BaseMeter.Track className="meter__track">
        <BaseMeter.Indicator className="meter__indicator" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
