import { Checkbox as ArkCheckbox } from "@ark-ui/react";
import { clsx } from "clsx";
import { Icon } from "../Icon/Icon.js";
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
  // Ark's Checkbox.Root *is* the <label>. Base UI took a separate `indeterminate`
  // prop; Ark folds it into the checked value ("indeterminate"). Adapt the
  // details-object callback back to the facade's (checked: boolean) signature.
  return (
    <ArkCheckbox.Root
      className={clsx("checkbox", disabled && "checkbox--disabled", className)}
      checked={indeterminate ? "indeterminate" : checked}
      defaultChecked={defaultChecked}
      onCheckedChange={
        onCheckedChange ? (details) => onCheckedChange(details.checked === true) : undefined
      }
      disabled={disabled}
      required={required}
      name={name}
      id={id}
    >
      <ArkCheckbox.Control className="checkbox__control">
        <ArkCheckbox.Indicator className="checkbox__indicator">
          {indeterminate ? (
            <span className="checkbox__indicator--indeterminate" />
          ) : (
            <Icon name="check" size={16} className="checkbox__check" />
          )}
        </ArkCheckbox.Indicator>
      </ArkCheckbox.Control>
      {label && <ArkCheckbox.Label className="checkbox__label text-default-body-large">{label}</ArkCheckbox.Label>}
      <ArkCheckbox.HiddenInput />
    </ArkCheckbox.Root>
  );
}
