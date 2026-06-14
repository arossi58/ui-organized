import * as React from "react";
import { Slider } from "@base-ui-components/react/slider";
import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { rangeStyles } from "./Range.styles.js";
import { FieldError } from "../FieldError/index.js";
import type { RangeProps } from "./Range.types.js";
import "./Range.css";

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Index of the value in `sorted` (ascending) closest to `target`. */
function nearestIndex(sorted: readonly number[], target: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < sorted.length; i += 1) {
    const v = sorted[i];
    if (v === undefined) continue;
    const dist = Math.abs(v - target);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

/**
 * A labelled range slider.
 *
 * Snapping is controlled two ways:
 * - `step` snaps at regular intervals between `min` and `max` (native, keyboard
 *   and pointer).
 * - `snapValues` snaps to a fixed set of allowed values. These are driven by
 *   index so the thumb lands exactly on an allowed value — and lands on the
 *   adjacent one with a single arrow-key press — regardless of their spacing.
 */
export function Range({
  label,
  value,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  snapValues,
  rangeLabels = false,
  startLabel,
  endLabel,
  size,
  error,
  disabled,
  hideValue = false,
  formatValue,
  name,
  id,
  className,
}: RangeProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  // A fixed set of allowed values is driven by index, so pointer drags and
  // arrow keys both settle exactly on an allowed value (evenly spaced).
  const snapPoints = React.useMemo(
    () =>
      snapValues && snapValues.length > 0
        ? [...snapValues].sort((a, b) => a - b)
        : null,
    [snapValues],
  );

  const resolvedMin = snapPoints ? (snapPoints[0] ?? min) : min;
  const resolvedMax = snapPoints
    ? (snapPoints[snapPoints.length - 1] ?? max)
    : max;

  // Resolve a public value from a raw slider value (an index when snapping).
  const toPublic = React.useCallback(
    (raw: number | readonly number[]): number => {
      const n = Array.isArray(raw) ? (raw[0] ?? 0) : (raw as number);
      if (!snapPoints) return n;
      const idx = clamp(Math.round(n), 0, snapPoints.length - 1);
      return snapPoints[idx] ?? resolvedMin;
    },
    [snapPoints, resolvedMin],
  );

  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = React.useState<number>(() => {
    const initial = defaultValue ?? resolvedMin;
    if (snapPoints) {
      return snapPoints[nearestIndex(snapPoints, initial)] ?? resolvedMin;
    }
    return clamp(initial, min, max);
  });
  const current = isControlled ? value : uncontrolled;

  // What the underlying Base UI slider actually drives.
  const sliderValue = snapPoints ? nearestIndex(snapPoints, current) : current;

  const handleChange = (raw: number | readonly number[]) => {
    const next = toPublic(raw);
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  };

  const handleCommitted = (raw: number | readonly number[]) => {
    onValueCommitted?.(toPublic(raw));
  };

  const displayValue = formatValue ? formatValue(current) : String(current);

  return (
    <Field.Root
      className={clsx(rangeStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      <div className="range__header">
        {label && <Field.Label className="range__label">{label}</Field.Label>}
        {!hideValue && <span className="range__value">{displayValue}</span>}
      </div>

      <Slider.Root
        className="range__slider"
        value={sliderValue}
        onValueChange={handleChange}
        onValueCommitted={handleCommitted}
        min={snapPoints ? 0 : min}
        max={snapPoints ? snapPoints.length - 1 : max}
        step={snapPoints ? 1 : step}
        disabled={disabled}
        name={name}
        id={id}
      >
        <div className="range__row">
          {rangeLabels && (
            <span className="range__range-label range__range-label--start">
              {startLabel ?? resolvedMin}
            </span>
          )}
          <Slider.Control className="range__control">
            <Slider.Track className="range__track">
              <Slider.Indicator className="range__indicator" />
              <Slider.Thumb className="range__thumb" />
            </Slider.Track>
          </Slider.Control>
          {rangeLabels && (
            <span className="range__range-label range__range-label--end">
              {endLabel ?? resolvedMax}
            </span>
          )}
        </div>
      </Slider.Root>

      {isInvalid && errorMessage && (
        <Field.Error match={true} render={<FieldError />}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
