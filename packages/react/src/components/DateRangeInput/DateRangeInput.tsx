import { useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Popover as ArkPopover } from "@ark-ui/react";
import { clsx } from "clsx";
import { inputFieldStyles } from "../Input/Input.styles.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import { Calendar } from "../Calendar/index.js";
import { parseISODate, toISODate } from "../Calendar/dateUtils.js";
import { DatePopover, datePopoverPositioning } from "../DateField/DatePopover.js";
import { openDatePicker } from "../DateField/openDatePicker.js";
import { useCoarsePointer } from "../DateField/useCoarsePointer.js";
import type { DateRangeInputProps, DateRangeValue } from "./DateRangeInput.types.js";
// Shares the Input field surface/state styling; InputAffix.css supplies the
// leading calendar buttons; DateRangeInput.css lays out the start/end pair.
import "../Input/Input.css";
import "../Input/InputAffix.css";
import "./DateRangeInput.css";

/**
 * A from–to date range built from two native `<input type="date">` controls on
 * the Input field surface, under one shared label, helper text and error.
 *
 * On fine pointers the leading calendar buttons open one shared DS-styled
 * two-month range calendar; on touch devices they defer to the OS-native
 * picker. The two ends auto-constrain each other (the end can't precede the
 * start) on top of the optional `min` / `max` bounds. Works controlled
 * (`value` + `onChange`) or uncontrolled (`defaultValue`).
 */
export function DateRangeInput({
  label,
  helperText,
  error,
  size,
  required,
  disabled,
  value,
  defaultValue,
  onChange,
  min,
  max,
  startName,
  endName,
  startLabel = "Start date",
  endLabel = "End date",
  separator = "–",
  className,
  id,
  portalContainer,
}: DateRangeInputProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  const reactId = useId();
  const labelId = `${reactId}-label`;
  const helperId = `${reactId}-helper`;
  const errorId = `${reactId}-error`;

  const coarse = useCoarsePointer();
  const [open, setOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<DateRangeValue>(() => ({
    start: (isControlled ? value?.start : defaultValue?.start) ?? "",
    end: (isControlled ? value?.end : defaultValue?.end) ?? "",
  }));
  const current: DateRangeValue = isControlled
    ? { start: value?.start ?? "", end: value?.end ?? "" }
    : internal;

  const update = (next: DateRangeValue) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const describedBy =
    [
      helperText && !isInvalid ? helperId : null,
      isInvalid && errorMessage ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const renderField = (side: "start" | "end", calendarButton: ReactNode) => {
    const isStart = side === "start";
    return (
      <div className="input-affix date-range__field">
        {calendarButton}
        <input
          ref={isStart ? startRef : endRef}
          type="date"
          className="field__control field__control--affix-start"
          // Native date inputs are never `:placeholder-shown`; flag empty so the
          // mm/dd/yyyy chrome renders in the placeholder colour.
          data-empty={(isStart ? current.start : current.end) ? undefined : true}
          value={isStart ? current.start : current.end}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            update(
              isStart
                ? { start: e.target.value, end: current.end }
                : { start: current.start, end: e.target.value },
            )
          }
          min={isStart ? min : current.start || min}
          max={isStart ? current.end || max : max}
          name={isStart ? startName : endName}
          required={required}
          disabled={disabled}
          aria-label={isStart ? startLabel : endLabel}
          aria-invalid={isInvalid || undefined}
        />
      </div>
    );
  };

  const calendarIconButton = (
    extra: { onClick?: () => void; ariaLabel: string },
  ): ReactNode => (
    <button
      type="button"
      className="input-affix__adornment input-affix__adornment--start input-affix__action"
      onClick={extra.onClick}
      disabled={disabled}
      aria-label={extra.ariaLabel}
    >
      <Icon name="calendar" size={20} />
    </button>
  );

  const sep = (
    <span className="date-range__separator" aria-hidden="true">
      {separator}
    </span>
  );

  let row: ReactNode;
  if (coarse) {
    row = (
      <div className="date-range__row" ref={rowRef}>
        {renderField(
          "start",
          calendarIconButton({
            onClick: () => openDatePicker(startRef.current),
            ariaLabel: `${startLabel} — choose date`,
          }),
        )}
        {sep}
        {renderField(
          "end",
          calendarIconButton({
            onClick: () => openDatePicker(endRef.current),
            ariaLabel: `${endLabel} — choose date`,
          }),
        )}
      </div>
    );
  } else {
    const startTrigger = (
      <ArkPopover.Trigger asChild>
        <button
          type="button"
          className="input-affix__adornment input-affix__adornment--start input-affix__action"
          disabled={disabled}
          aria-label={`${startLabel} — choose date`}
        >
          <Icon name="calendar" size={20} />
        </button>
      </ArkPopover.Trigger>
    );
    row = (
      <ArkPopover.Root
        open={open}
        onOpenChange={(details) => setOpen(details.open)}
        positioning={datePopoverPositioning(rowRef)}
        initialFocusEl={() => activeDayRef.current}
      >
        <div className="date-range__row" ref={rowRef}>
          {renderField("start", startTrigger)}
          {sep}
          {renderField(
            "end",
            calendarIconButton({
              onClick: () => setOpen(true),
              ariaLabel: `${endLabel} — choose date`,
            }),
          )}
        </div>
        <DatePopover container={portalContainer}>
          <Calendar
            mode="range"
            numMonths={2}
            rangeValue={{
              start: parseISODate(current.start),
              end: parseISODate(current.end),
            }}
            min={parseISODate(min)}
            max={parseISODate(max)}
            onRangeChange={(r) =>
              update({
                start: r.start ? toISODate(r.start) : "",
                end: r.end ? toISODate(r.end) : "",
              })
            }
            onRangeComplete={() => setOpen(false)}
            activeDayRef={activeDayRef}
          />
        </DatePopover>
      </ArkPopover.Root>
    );
  }

  return (
    <div
      id={id}
      role="group"
      aria-labelledby={label ? labelId : undefined}
      aria-describedby={describedBy}
      data-disabled={disabled || undefined}
      className={clsx(inputFieldStyles({ size }), "date-range", className)}
    >
      {label && (
        <span id={labelId} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </span>
      )}
      {row}
      {helperText && !isInvalid && (
        <p id={helperId} className="field__description">
          {helperText}
        </p>
      )}
      {isInvalid && errorMessage && <FieldError id={errorId}>{errorMessage}</FieldError>}
    </div>
  );
}
