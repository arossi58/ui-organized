import * as React from "react";
import { NumberInput, Field } from "@ark-ui/react";
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
      <NumberInput.Root
        ids={{ input: fieldId }}
        value={value === undefined ? undefined : value === null ? "" : String(value)}
        defaultValue={defaultValue != null ? String(defaultValue) : undefined}
        onValueChange={
          onValueChange
            ? (details) =>
                onValueChange(details.value === "" ? null : details.valueAsNumber)
            : undefined
        }
        min={min}
        max={max}
        step={step}
        formatOptions={format}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
      >
        <NumberInput.Control className="number-field__group">
          <NumberInput.DecrementTrigger className="number-field__stepper" aria-label="Decrease">
            <Icon name="minus" size={16} />
          </NumberInput.DecrementTrigger>
          <NumberInput.Input
            className="field__control number-field__input"
            placeholder={placeholder}
          />
          <NumberInput.IncrementTrigger className="number-field__stepper" aria-label="Increase">
            <Icon name="plus" size={16} />
          </NumberInput.IncrementTrigger>
        </NumberInput.Control>
      </NumberInput.Root>
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
