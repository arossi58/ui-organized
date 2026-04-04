import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox";
import { clsx } from "clsx";
import type { CheckboxProps } from "./Checkbox.types.js";
import "./Checkbox.css";

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  indeterminate,
  disabled,
  required,
  name,
  id,
  className,
}: CheckboxProps) {
  return (
    <label className={clsx("checkbox", disabled && "checkbox--disabled", className)}>
      <BaseCheckbox.Root
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        indeterminate={indeterminate}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className="checkbox__control"
      >
        <BaseCheckbox.Indicator className="checkbox__indicator">
          <span
            className={
              indeterminate
                ? "checkbox__indicator--indeterminate"
                : "checkbox__indicator--check"
            }
          />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  );
}
