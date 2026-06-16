import { Combobox as BaseCombobox } from "@base-ui-components/react/combobox";
import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { comboboxFieldStyles } from "./Combobox.styles.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import type { ComboboxProps, ComboboxOption } from "./Combobox.types.js";
import "./Combobox.css";

export function Combobox({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  label,
  helperText,
  error,
  size,
  disabled,
  name,
  required,
  className,
  emptyMessage = "No results found.",
  portalContainer,
}: ComboboxProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  // Map the public string value to the option object Base UI tracks.
  const selected =
    value !== undefined ? (options.find((o) => o.value === value) ?? undefined) : undefined;
  const defaultSelected =
    defaultValue !== undefined ? (options.find((o) => o.value === defaultValue) ?? null) : undefined;

  return (
    <Field.Root
      className={clsx(comboboxFieldStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {label && (
        <Field.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <BaseCombobox.Root<ComboboxOption>
        items={options}
        value={selected}
        defaultValue={defaultSelected}
        onValueChange={
          onValueChange
            ? (item: ComboboxOption | null) => onValueChange(item ? item.value : "")
            : undefined
        }
        disabled={disabled}
        name={name}
        required={required}
      >
        <div className="combobox-field__control">
          <BaseCombobox.Input
            className="field__control combobox-field__input"
            placeholder={placeholder}
          />
          <BaseCombobox.Trigger className="combobox-field__trigger" aria-label="Toggle options">
            <Icon name="chevron-down" size={16} />
          </BaseCombobox.Trigger>
        </div>
        <BaseCombobox.Portal container={portalContainer}>
          <BaseCombobox.Positioner className="combobox-positioner" sideOffset={4}>
            <BaseCombobox.Popup className="combobox-popup">
              <BaseCombobox.Empty className="combobox-popup__empty">
                {emptyMessage}
              </BaseCombobox.Empty>
              <BaseCombobox.List className="combobox-popup__list">
                {(item: ComboboxOption) => (
                  <BaseCombobox.Item
                    key={item.value}
                    value={item}
                    disabled={item.disabled}
                    className="combobox-popup__item"
                  >
                    <span className="combobox-popup__item-label">{item.label}</span>
                    <BaseCombobox.ItemIndicator className="combobox-popup__item-indicator">
                      <Icon name="check" size={18} />
                    </BaseCombobox.ItemIndicator>
                  </BaseCombobox.Item>
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
      {helperText && !isInvalid && (
        <Field.Description className="field__description">{helperText}</Field.Description>
      )}
      {isInvalid && errorMessage && (
        <Field.Error match={true} render={<FieldError />}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
