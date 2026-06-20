import { Switch as ArkSwitch } from "@ark-ui/react";
import { clsx } from "clsx";
import type { SwitchProps } from "./Switch.types.js";
import "./Switch.css";

export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  required,
  name,
  id,
  className,
}: SwitchProps) {
  // Ark's Switch.Root *is* the <label>, so the wrapper element and the
  // interactive root are one and the same (Base UI nested a separate <label>).
  // onCheckedChange receives a details object in Ark; adapt to the facade's
  // (checked: boolean) signature so the public API is unchanged.
  return (
    <ArkSwitch.Root
      className={clsx("switch", className)}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={
        onCheckedChange ? (details) => onCheckedChange(details.checked) : undefined
      }
      disabled={disabled}
      required={required}
      name={name}
      id={id}
    >
      <ArkSwitch.Control className="switch__track">
        <ArkSwitch.Thumb className="switch__thumb" />
      </ArkSwitch.Control>
      {label && <ArkSwitch.Label className="switch__label text-default-body-large">{label}</ArkSwitch.Label>}
      <ArkSwitch.HiddenInput />
    </ArkSwitch.Root>
  );
}
