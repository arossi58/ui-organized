import { useMemo } from "react";
import { DatePicker as ArkDatePicker, Portal, parseDate } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import { CONTROL_ICON_SIZE, type ControlSize } from "../controlSize.js";
import { datePickerStyles } from "./DatePicker.styles.js";
import type { DatePickerProps } from "./DatePicker.types.js";
import "./DatePicker.css";
import { useContainedPositioning, useOverlayPortal } from "../../preview/useOverlayPortal.js";

/** Weekday header and navigation glyphs stay one step below the cell text. */
const NAV_ICON_SIZE = 16;

/** ISO dates in, parsed calendar dates out. The machine works in `DateValue`;
 *  the public API is the string form everyone already stores. */
const toDateValues = (dates: string[] | undefined) =>
  dates ? dates.map((d) => parseDate(d)) : undefined;

export function DatePicker({
  label,
  helperText,
  error,
  value,
  defaultValue,
  onValueChange,
  selectionMode,
  min,
  max,
  numOfMonths,
  locale,
  open,
  defaultOpen,
  onOpenChange,
  size = "md",
  variant,
  required,
  disabled,
  readOnly,
  name,
  container,
  className,
}: DatePickerProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const iconSize = CONTROL_ICON_SIZE[size as ControlSize];
  const portal = useOverlayPortal(container);
  const containedPositioning = useContainedPositioning();

  const parsedValue = useMemo(() => toDateValues(value), [value]);
  const parsedDefault = useMemo(() => toDateValues(defaultValue), [defaultValue]);
  const parsedMin = useMemo(() => (min ? parseDate(min) : undefined), [min]);
  const parsedMax = useMemo(() => (max ? parseDate(max) : undefined), [max]);

  return (
    <ArkDatePicker.Root
      className={clsx(datePickerStyles({ size, variant }), className)}
      value={parsedValue}
      defaultValue={parsedDefault}
      onValueChange={(details) => onValueChange?.(details.value.map(String))}
      selectionMode={selectionMode}
      min={parsedMin}
      max={parsedMax}
      numOfMonths={numOfMonths}
      locale={locale}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(details) => onOpenChange?.(details.open)}
      invalid={isInvalid}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      positioning={{ placement: "bottom-start", gutter: 4, ...containedPositioning }}
    >
      {label && (
        <ArkDatePicker.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </ArkDatePicker.Label>
      )}

      <ArkDatePicker.Control className="date-picker__control">
        <ArkDatePicker.Input className="date-picker__input" index={0} />
        {selectionMode === "range" && (
          <ArkDatePicker.Input className="date-picker__input" index={1} />
        )}
        <ArkDatePicker.Trigger className="date-picker__trigger">
          <Icon name="calendar" size={iconSize} />
        </ArkDatePicker.Trigger>
      </ArkDatePicker.Control>

      <Portal {...portal}>
        {/* The positioner className must stay a plain string literal — the
            overlay-stacking test scans for it, and a clsx() call here silently
            unregisters the layer. */}
        <ArkDatePicker.Positioner className="date-picker__positioner">
          <ArkDatePicker.Content className="date-picker__popup">
            <ArkDatePicker.View view="day">
              <ArkDatePicker.Context>
                {(api) => (
                  <>
                    <ArkDatePicker.ViewControl className="date-picker__view-control">
                      <ArkDatePicker.PrevTrigger className="date-picker__nav">
                        <Icon name="chevron-left" size={NAV_ICON_SIZE} />
                      </ArkDatePicker.PrevTrigger>
                      <ArkDatePicker.ViewTrigger className="date-picker__view-trigger">
                        <ArkDatePicker.RangeText />
                      </ArkDatePicker.ViewTrigger>
                      <ArkDatePicker.NextTrigger className="date-picker__nav">
                        <Icon name="chevron-right" size={NAV_ICON_SIZE} />
                      </ArkDatePicker.NextTrigger>
                    </ArkDatePicker.ViewControl>

                    <ArkDatePicker.Table className="date-picker__table">
                      <ArkDatePicker.TableHead>
                        <ArkDatePicker.TableRow>
                          {api.weekDays.map((day) => (
                            <ArkDatePicker.TableHeader
                              key={day.long}
                              className="date-picker__weekday"
                              aria-label={day.long}
                            >
                              {day.narrow}
                            </ArkDatePicker.TableHeader>
                          ))}
                        </ArkDatePicker.TableRow>
                      </ArkDatePicker.TableHead>
                      <ArkDatePicker.TableBody>
                        {api.weeks.map((week, weekIndex) => (
                          <ArkDatePicker.TableRow key={weekIndex}>
                            {week.map((day, dayIndex) => (
                              <ArkDatePicker.TableCell
                                key={dayIndex}
                                value={day}
                                className="date-picker__cell"
                              >
                                <ArkDatePicker.TableCellTrigger className="date-picker__day">
                                  {day.day}
                                </ArkDatePicker.TableCellTrigger>
                              </ArkDatePicker.TableCell>
                            ))}
                          </ArkDatePicker.TableRow>
                        ))}
                      </ArkDatePicker.TableBody>
                    </ArkDatePicker.Table>
                  </>
                )}
              </ArkDatePicker.Context>
            </ArkDatePicker.View>
          </ArkDatePicker.Content>
        </ArkDatePicker.Positioner>
      </Portal>

      {helperText && !isInvalid && (
        <span className="field__description">{helperText}</span>
      )}
      {isInvalid && errorMessage && <FieldError>{errorMessage}</FieldError>}
    </ArkDatePicker.Root>
  );
}
