import { Progress as ArkProgress } from "@ark-ui/react";
import { clsx } from "clsx";
import { progressStyles } from "./Progress.styles.js";
import type { ProgressProps } from "./Progress.types.js";
import "./Progress.css";

export function Progress({
  value = null,
  max = 100,
  label,
  showValue = false,
  variant,
  size,
  className,
}: ProgressProps) {
  const showHeader = label != null || showValue;

  return (
    <ArkProgress.Root
      value={value}
      max={max}
      className={clsx(progressStyles({ variant, size }), className)}
    >
      {showHeader && (
        <div className="progress__header text-default-body-small">
          {label != null && (
            <ArkProgress.Label className="progress__label">{label}</ArkProgress.Label>
          )}
          {showValue && <ArkProgress.ValueText className="progress__value" />}
        </div>
      )}
      <ArkProgress.Track className="progress__track">
        <ArkProgress.Range className="progress__indicator" />
      </ArkProgress.Track>
    </ArkProgress.Root>
  );
}
