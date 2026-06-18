import { RadioGroup as ArkRadioGroup } from "@ark-ui/react";
import { clsx } from "clsx";
import { radioGroupStyles } from "./Radio.styles.js";
import { Icon } from "../Icon/index.js";
import type { RadioGroupProps } from "./Radio.types.js";
import "./Radio.css";

export function RadioGroup({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  orientation = "vertical",
  disabled,
  name,
  className,
}: RadioGroupProps) {
  return (
    <div className={clsx(radioGroupStyles({ orientation }), className)}>
      {label && <div className="radio-group__label">{label}</div>}
      <ArkRadioGroup.Root
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
        orientation={orientation}
        className="radio-group__items"
      >
        {options.map((opt) => (
          <div key={opt.value} className="radio-item-wrap">
            {/* Ark's RadioGroup.Item *is* the <label>; the dot is a plain child
                of ItemControl, shown via [data-state="checked"] in CSS. */}
            <ArkRadioGroup.Item
              value={opt.value}
              disabled={opt.disabled}
              className={clsx(
                "radio-item",
                opt.disabled && "radio-item--disabled",
                opt.error && "radio-item--error",
              )}
            >
              <ArkRadioGroup.ItemControl className="radio-item__control">
                <span className="radio-item__indicator" />
              </ArkRadioGroup.ItemControl>
              <ArkRadioGroup.ItemText className="radio-item__label">
                {opt.label}
              </ArkRadioGroup.ItemText>
              <ArkRadioGroup.ItemHiddenInput />
            </ArkRadioGroup.Item>
            {opt.error && (
              <div className="radio-item__error-message">
                <Icon name="alert-circle" size={16} />
                <span className="radio-item__error-text">{opt.error}</span>
              </div>
            )}
          </div>
        ))}
      </ArkRadioGroup.Root>
    </div>
  );
}
