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
  shape = "linear",
  className,
}: ProgressProps) {
  const showHeader = label != null || showValue;
  const isCircular = shape === "circular";

  return (
    <ArkProgress.Root
      value={value}
      max={max}
      className={clsx(progressStyles({ variant, size, shape }), className)}
    >
      {showHeader && (
        <div className="progress__header text-default-body-small">
          {label != null && (
            <ArkProgress.Label className="progress__label">{label}</ArkProgress.Label>
          )}
          {/* A ring has room inside it, so the value sits in the middle rather
              than in the header — see the circular branch below. */}
          {showValue && !isCircular && (
            <ArkProgress.ValueText className="progress__value" />
          )}
        </div>
      )}
      {isCircular ? (
        <div className="progress__circle-wrap">
          <ArkProgress.Circle className="progress__circle">
            <ArkProgress.CircleTrack className="progress__circle-track" />
            <ArkProgress.CircleRange className="progress__circle-range" />
          </ArkProgress.Circle>
          {showValue && (
            <ArkProgress.ValueText className="progress__circle-value text-emphasis-body-medium" />
          )}
        </div>
      ) : (
        <ArkProgress.Track className="progress__track">
          <ArkProgress.Range className="progress__indicator" />
        </ArkProgress.Track>
      )}
    </ArkProgress.Root>
  );
}
