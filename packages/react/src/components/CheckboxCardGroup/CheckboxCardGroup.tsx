import { useId } from "react";
import { Checkbox as ArkCheckbox } from "@ark-ui/react";
import { clsx } from "clsx";
import { OMIT_ARIA, checkboxCardGroupStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { glyph } from "../../icons/glyph.js";
import type { CheckboxCardGroupProps } from "./CheckboxCardGroup.types.js";
import "@ui-organized/core/components/Checkbox/Checkbox.css";
import "@ui-organized/core/components/SelectionCard/SelectionCard.css";

/** Card icons, the check and the error glyph are 20, 16 and 16 px at every size. */
const ICON_SIZE = 20;
const CHECK_SIZE = 16;
const ERROR_ICON_SIZE = 16;

export function CheckboxCardGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  columns,
  size,
  indicator = "end",
  disabled,
  name,
  error,
  className,
  "aria-label": ariaLabel,
}: CheckboxCardGroupProps) {
  const uid = useId();
  const labelId = `${uid}label`;
  const errorId = `${uid}error`;
  const descriptionId = (v: string) => `${uid}description-${v}`;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <div className={clsx(checkboxCardGroupStyles({ size, columns, invalid: !!error }), className)}>
      {label && (
        <div className="selection-card-group__label" id={labelId}>
          {label}
        </div>
      )}
      <ArkCheckbox.Group
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        name={name}
        invalid={!!error}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={errorMessage ? errorId : undefined}
        className="selection-card-group__items"
      >
        {options.map((opt) => (
          // Each Root is the <label>, so the whole card is the hit target.
          <ArkCheckbox.Root
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            className={clsx("selection-card", `selection-card--indicator-${indicator}`)}
          >
            {opt.icon != null && (
              <span className="selection-card__icon" aria-hidden="true">
                <Icon name={opt.icon} size={ICON_SIZE} />
              </span>
            )}
            <span className="selection-card__body">
              <ArkCheckbox.Label className="selection-card__title">{opt.label}</ArkCheckbox.Label>
              {opt.description && (
                <span className="selection-card__description" id={descriptionId(opt.value)}>
                  {opt.description}
                </span>
              )}
            </span>
            <ArkCheckbox.Control className="checkbox__control selection-card__control">
              <ArkCheckbox.Indicator className="checkbox__indicator">
                <Icon name={glyph("check")} size={CHECK_SIZE} className="checkbox__check" />
              </ArkCheckbox.Indicator>
            </ArkCheckbox.Control>
            {/* Named by the title alone; the description is read after it. */}
            <ArkCheckbox.HiddenInput
              aria-describedby={opt.description ? descriptionId(opt.value) : undefined}
            />
          </ArkCheckbox.Root>
        ))}
      </ArkCheckbox.Group>
      {errorMessage && (
        <div className="selection-card-group__error" id={errorId}>
          <Icon name={glyph("alert-circle")} size={ERROR_ICON_SIZE} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
