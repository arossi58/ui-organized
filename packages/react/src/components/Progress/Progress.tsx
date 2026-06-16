import { Progress as BaseProgress } from "@base-ui-components/react/progress";
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
    <BaseProgress.Root
      value={value}
      max={max}
      className={clsx(progressStyles({ variant, size }), className)}
    >
      {showHeader && (
        <div className="progress__header">
          {label != null && (
            <BaseProgress.Label className="progress__label">{label}</BaseProgress.Label>
          )}
          {showValue && <BaseProgress.Value className="progress__value" />}
        </div>
      )}
      <BaseProgress.Track className="progress__track">
        <BaseProgress.Indicator className="progress__indicator" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
