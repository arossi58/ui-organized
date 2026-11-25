import { useId } from "react";
import { RadioGroup as ArkRadioGroup } from "@ark-ui/react";
import { clsx } from "clsx";
import { OMIT_ARIA, radioCardGroupStyles } from "@ui-organized/core";
import { Icon } from "../Icon/index.js";
import { glyph } from "../../icons/glyph.js";
import type { RadioCardGroupProps } from "./RadioCardGroup.types.js";
import "@ui-organized/core/components/Radio/Radio.css";
import "@ui-organized/core/components/SelectionCard/SelectionCard.css";

/** Card icons and the error glyph are 20 and 16 px at every size. */
const ICON_SIZE = 20;
const ERROR_ICON_SIZE = 16;

export function RadioCardGroup({
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
}: RadioCardGroupProps) {
  // The group label sits outside Ark's Root, as RadioGroup's does, so Ark is
  // handed the id of the heading this renders rather than one that dangles.
  const uid = useId();
  const labelId = `${uid}label`;
  const errorId = `${uid}error`;
  const descriptionId = (v: string) => `${uid}description-${v}`;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <div className={clsx(radioCardGroupStyles({ size, columns, invalid: !!error }), className)}>
      {label && (
        <div className="selection-card-group__label" id={labelId}>
          {label}
        </div>
      )}
      <ArkRadioGroup.Root
        ids={label ? { label: labelId } : undefined}
        aria-labelledby={label ? undefined : OMIT_ARIA}
        aria-label={label ? undefined : ariaLabel}
        aria-describedby={errorMessage ? errorId : undefined}
        value={value}
        defaultValue={defaultValue}
        onValueChange={
          onValueChange
            ? (details) => {
                if (details.value != null) onValueChange(details.value);
              }
            : undefined
        }
        disabled={disabled}
        name={name}
        className="selection-card-group__items"
      >
        {options.map((opt) => (
          // The Item is the <label>, so the whole card is the hit target.
          <ArkRadioGroup.Item
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
              <ArkRadioGroup.ItemText className="selection-card__title">{opt.label}</ArkRadioGroup.ItemText>
              {opt.description && (
                <span className="selection-card__description" id={descriptionId(opt.value)}>
                  {opt.description}
                </span>
              )}
            </span>
            <ArkRadioGroup.ItemControl className="radio-item__control selection-card__control">
              <span className="radio-item__indicator" />
            </ArkRadioGroup.ItemControl>
            {/* Named by the title alone; the description is read after it. */}
            <ArkRadioGroup.ItemHiddenInput
              aria-describedby={opt.description ? descriptionId(opt.value) : undefined}
            />
          </ArkRadioGroup.Item>
        ))}
      </ArkRadioGroup.Root>
      {errorMessage && (
        <div className="selection-card-group__error" id={errorId}>
          <Icon name={glyph("alert-circle")} size={ERROR_ICON_SIZE} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
