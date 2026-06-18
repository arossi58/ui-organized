import { useEffect, useRef, useState } from "react";
import type * as React from "react";
import { Field } from "@base-ui-components/react/field";
import { Popover } from "@base-ui-components/react/popover";
import { clsx } from "clsx";
import { inputFieldStyles } from "../Input/Input.styles.js";
import { Button } from "../Button/index.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import { Calendar } from "../Calendar/index.js";
import { parseISODate, toISODate, todayYMD, type YMD } from "../Calendar/dateUtils.js";
import { openDatePicker } from "./openDatePicker.js";
import { setNativeInputValue } from "./setNativeInputValue.js";
import { useCoarsePointer } from "./useCoarsePointer.js";
import { DatePopover } from "./DatePopover.js";
import type { DateFieldBaseProps } from "./DateFieldBase.types.js";
// Shares the Input field surface/state styling; InputAffix.css supplies the
// leading calendar button and hides the native picker chrome.
import "../Input/Input.css";
import "../Input/InputAffix.css";

function splitDateTime(value: string): { date: string; time: string } {
  const [date = "", time = ""] = value.split("T");
  return { date, time };
}

/**
 * Shared single date/time field used by DateInput and DateTimeInput.
 *
 * The native `<input>` keeps full functionality (typing, value, min/max). The
 * leading calendar button opens the DS-styled calendar popover on fine pointers
 * (mouse), or the OS-native picker on touch devices. For datetime the popover
 * adds a time field beneath the calendar.
 */
export function DateFieldBase({
  type,
  pickerLabel,
  label,
  helperText,
  error,
  size,
  required,
  className,
  disabled,
  value,
  defaultValue,
  onChange,
  min,
  max,
  portalContainer,
  ...inputProps
}: DateFieldBaseProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const isDateTime = type === "datetime-local";

  const coarse = useCoarsePointer();
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const activeDayRef = useRef<HTMLButtonElement | null>(null);

  // Track the value so the calendar mirrors typed edits and can write back.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    String((isControlled ? value : defaultValue) ?? ""),
  );
  useEffect(() => {
    if (isControlled) setInternalValue(String(value ?? ""));
  }, [isControlled, value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  };

  const minStr = typeof min === "string" ? min : undefined;
  const maxStr = typeof max === "string" ? max : undefined;
  const { date: datePart, time: timePart } = splitDateTime(internalValue);

  const handleDaySelect = (day: YMD) => {
    const iso = toISODate(day);
    if (isDateTime) {
      setNativeInputValue(inputRef.current, `${iso}T${timePart || "00:00"}`);
      // Keep the popover open so the time can still be set.
    } else {
      setNativeInputValue(inputRef.current, iso);
      setOpen(false);
    }
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const day = datePart || toISODate(todayYMD());
    setNativeInputValue(inputRef.current, `${day}T${event.target.value}`);
  };

  const control = (
    <Field.Control
      render={<input ref={inputRef} type={type} />}
      className="field__control field__control--affix-start"
      required={required}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      min={min}
      max={max}
      {...inputProps}
    />
  );

  return (
    <Field.Root className={clsx(inputFieldStyles({ size }), className)} invalid={isInvalid}>
      {label && (
        <Field.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}

      {coarse ? (
        <div className="input-affix" ref={fieldRef}>
          <button
            type="button"
            className="input-affix__adornment input-affix__adornment--start input-affix__action"
            onClick={() => openDatePicker(inputRef.current)}
            disabled={disabled}
            aria-label={pickerLabel}
          >
            <Icon name="calendar" size={20} />
          </button>
          {control}
        </div>
      ) : (
        <Popover.Root open={open} onOpenChange={setOpen}>
          <div className="input-affix" ref={fieldRef}>
            <Popover.Trigger
              render={
                <button
                  type="button"
                  className="input-affix__adornment input-affix__adornment--start input-affix__action"
                  disabled={disabled}
                  aria-label={pickerLabel}
                />
              }
            >
              <Icon name="calendar" size={20} />
            </Popover.Trigger>
            {control}
          </div>
          <DatePopover
            anchorRef={fieldRef}
            initialFocus={activeDayRef}
            container={portalContainer}
          >
            <Calendar
              mode="single"
              value={parseISODate(datePart)}
              min={parseISODate(minStr)}
              max={parseISODate(maxStr)}
              onSelect={handleDaySelect}
              activeDayRef={activeDayRef}
            />
            {isDateTime && (
              <div className="date-popover__footer">
                <input
                  type="time"
                  className="field__control date-popover__time"
                  value={timePart}
                  onChange={handleTimeChange}
                  aria-label="Time"
                />
                <Button
                  type="button"
                  intent="primary"
                  size="md"
                  className="date-popover__done"
                  onClick={() => setOpen(false)}
                >
                  Done
                </Button>
              </div>
            )}
          </DatePopover>
        </Popover.Root>
      )}

      {helperText && !isInvalid && (
        <Field.Description className="field__description">
          {helperText}
        </Field.Description>
      )}
      {isInvalid && errorMessage && (
        <Field.Error match={true} render={<FieldError />}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
