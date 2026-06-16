import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui-components/react/number-field";
import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { numberFieldStyles } from "./NumberField.styles.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import type { NumberFieldProps } from "./NumberField.types.js";
import "./NumberField.css";

export function NumberField({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step,
  format,
  placeholder,
  label,
  helperText,
  error,
  size,
  disabled,
  readOnly,
  required,
  name,
  id,
  className,
}: NumberFieldProps) {
  const reactId = React.useId();
  const fieldId = id ?? reactId;
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <Field.Root
      className={clsx(numberFieldStyles({ size }), className)}
      invalid={isInvalid}
      disabled={disabled}
    >
      {label && (
        <Field.Label htmlFor={fieldId} className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <BaseNumberField.Root
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange ? (v) => onValueChange(v) : undefined}
        min={min}
        max={max}
        step={step}
        format={format}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
      >
        <BaseNumberField.Group className="number-field__group">
          <BaseNumberField.Decrement className="number-field__stepper" aria-label="Decrease">
            <Icon name="minus" size={16} />
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            className="field__control number-field__input"
            placeholder={placeholder}
          />
          <BaseNumberField.Increment className="number-field__stepper" aria-label="Increase">
            <Icon name="plus" size={16} />
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
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
