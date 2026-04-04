import { Switch as BaseSwitch } from "@base-ui-components/react/switch";
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
  return (
    <label className={clsx("switch", className)}>
      <BaseSwitch.Root
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className="switch__track"
      >
        <BaseSwitch.Thumb className="switch__thumb" />
      </BaseSwitch.Root>
      {label && <span className="switch__label">{label}</span>}
    </label>
  );
}
