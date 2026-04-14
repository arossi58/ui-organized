import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { inputFieldStyles } from "./Input.styles.js";
import type { InputProps } from "./Input.types.js";
import "./Input.css";

export function Input({
  label,
  helperText,
  error,
  size,
  required,
  id,
  className,
  ...inputProps
}: InputProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <Field.Root
      className={clsx(inputFieldStyles({ size }), className)}
      invalid={isInvalid}
    >
      {label && (
        <Field.Label className="input-field__label">
          {label}
          {required && <span className="input-field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <Field.Control
        className="input-field__control"
        required={required}
        {...inputProps}
      />
      {helperText && !isInvalid && (
        <Field.Description className="input-field__description">
          {helperText}
        </Field.Description>
      )}
      {isInvalid && (
        <Field.Error className="input-field__error" match={true}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
