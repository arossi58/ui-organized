import { useMemo } from "react";
import { Field, Select as ArkSelect, Portal, createListCollection } from "@ark-ui/react";
import { clsx } from "clsx";
import { selectFieldStyles } from "./Select.styles.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
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
  portalContainer,
}: SelectProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  // Ark drives the dropdown off a collection rather than children; build it from
  // the `options` array (label → display text, value → form value).
  const collection = useMemo(
    () =>
      createListCollection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
        isItemDisabled: (item) => !!item.disabled,
      }),
    [options],
  );

  return (
    <Field.Root
      className={clsx(selectFieldStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {/* Ark Select.Root renders a wrapping <div>; `display:contents` keeps the
          label / trigger / helper as direct flex children of the field. */}
      <ArkSelect.Root
        className="select-field__control"
        collection={collection}
        value={value != null ? [value] : undefined}
        defaultValue={defaultValue != null ? [defaultValue] : undefined}
        onValueChange={
          onValueChange
            ? (details) => {
                const next = details.value[0];
                if (next != null) onValueChange(next);
              }
            : undefined
        }
        invalid={isInvalid}
        disabled={disabled}
        name={name}
        required={required}
        positioning={{ placement: "bottom-start", gutter: 4, strategy: "fixed" }}
      >
        {label && (
          <ArkSelect.Label className="field__label">
            {label}
            {required && <span className="field__required" aria-hidden="true" />}
          </ArkSelect.Label>
        )}
        <ArkSelect.Trigger className="select-field__trigger text-default-body-large">
          <ArkSelect.ValueText className="select-field__value" placeholder={placeholder} />
          <ArkSelect.Indicator className="select-field__icon">
            <Icon name="chevron-down" size={16} />
          </ArkSelect.Indicator>
        </ArkSelect.Trigger>
        <Portal container={portalContainer ? { current: portalContainer } : undefined}>
          <ArkSelect.Positioner className="select-positioner">
            <ArkSelect.Content className="select-popup">
              <ArkSelect.List className="select-popup__list">
                {options.map((opt) => (
                  <ArkSelect.Item key={opt.value} item={opt} className="select-popup__item text-default-body-large">
                    <ArkSelect.ItemText>{opt.label}</ArkSelect.ItemText>
                    <ArkSelect.ItemIndicator className="select-popup__item-indicator">
                      <Icon name="check" size={20} />
                    </ArkSelect.ItemIndicator>
                  </ArkSelect.Item>
                ))}
              </ArkSelect.List>
            </ArkSelect.Content>
          </ArkSelect.Positioner>
        </Portal>
        <ArkSelect.HiddenSelect />
      </ArkSelect.Root>
      {helperText && !isInvalid && (
        <Field.HelperText className="field__description">{helperText}</Field.HelperText>
      )}
      {isInvalid && errorMessage && (
        <Field.ErrorText asChild>
          <FieldError>{errorMessage}</FieldError>
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
