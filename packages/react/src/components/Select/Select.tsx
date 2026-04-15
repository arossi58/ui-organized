import { Select as BaseSelect } from "@base-ui-components/react/select";
import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { selectFieldStyles } from "./Select.styles.js";
import { Icon } from "../Icon/index.js";
import type { SelectProps } from "./Select.types.js";
import "./Select.css";

export function Select({
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
}: SelectProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <Field.Root
      className={clsx(selectFieldStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {label && (
        <Field.Label className="select-field__label">
          {label}
          {required && <span className="select-field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <BaseSelect.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={
          onValueChange
            ? (v: string | null) => { if (v !== null) onValueChange(v); }
            : undefined
        }
        disabled={disabled}
        name={name}
        required={required}
      >
        <BaseSelect.Trigger className="select-field__trigger">
          <BaseSelect.Value>
            {(val: string | null) => {
              if (val === null || val === undefined) {
                return placeholder ? (
                  <span className="select-field__placeholder">{placeholder}</span>
                ) : null;
              }
              return options.find((o) => o.value === val)?.label ?? val;
            }}
          </BaseSelect.Value>
          <BaseSelect.Icon className="select-field__icon" render={<span />}>
            <Icon name="chevron-down" size={16} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner className="select-positioner" sideOffset={4}>
            <BaseSelect.Popup className="select-popup">
              <BaseSelect.List className="select-popup__list">
                {options.map((opt) => (
                  <BaseSelect.Item
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="select-popup__item"
                  >
                    <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="select-popup__item-indicator">
                      <Icon name="check" size={20} />
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {helperText && !isInvalid && (
        <Field.Description className="select-field__description">
          {helperText}
        </Field.Description>
      )}
      {isInvalid && (
        <Field.Error className="select-field__error" match={true}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
