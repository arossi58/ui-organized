import { RadioGroup as BaseRadioGroup } from "@base-ui-components/react/radio-group";
import { Radio as BaseRadio } from "@base-ui-components/react/radio";
import { clsx } from "clsx";
import { radioGroupStyles } from "./Radio.styles.js";
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
      <BaseRadioGroup
        value={value}
        defaultValue={defaultValue}
        onValueChange={
          onValueChange
            ? (v: unknown) => { if (typeof v === "string") onValueChange(v); }
            : undefined
        }
        disabled={disabled}
        name={name}
        className="radio-group__items"
      >
        {options.map((opt) => (
          <label
            key={opt.value}
            className={clsx("radio-item", opt.disabled && "radio-item--disabled")}
          >
            <BaseRadio.Root
              value={opt.value}
              disabled={opt.disabled}
              className="radio-item__control"
            >
              <BaseRadio.Indicator className="radio-item__indicator" />
            </BaseRadio.Root>
            <span className="radio-item__label">{opt.label}</span>
          </label>
        ))}
      </BaseRadioGroup>
    </div>
  );
}
