import { useState } from "react";
import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { passwordInputFieldStyles } from "./PasswordInput.styles.js";
import { Icon } from "../Icon/index.js";
import { FieldError } from "../FieldError/index.js";
import type { PasswordInputProps } from "./PasswordInput.types.js";
// Shares the Input field surface/state styling; InputAffix.css layers on the
// trailing show/hide toggle.
import "../Input/Input.css";
import "../Input/InputAffix.css";

export function PasswordInput({
  label,
  helperText,
  error,
  size,
  required,
  showToggle = true,
  className,
  disabled,
  ...inputProps
}: PasswordInputProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;
  const [visible, setVisible] = useState(false);

  return (
    <Field.Root
      className={clsx(passwordInputFieldStyles({ size }), className)}
      invalid={isInvalid}
    >
      {label && (
        <Field.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <div className="input-affix">
        <Field.Control
          render={<input type={visible ? "text" : "password"} />}
          className={clsx(
            "field__control",
            showToggle && "field__control--affix-end",
          )}
          required={required}
          disabled={disabled}
          {...inputProps}
        />
        {showToggle && (
          <button
            type="button"
            className="input-affix__adornment input-affix__adornment--end input-affix__action"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            disabled={disabled}
          >
            <Icon name={visible ? "eye-off" : "eye"} size={20} />
          </button>
        )}
      </div>
      {helperText && !isInvalid && (
        <Field.Description className="field__description">
          {helperText}
        </Field.Description>
      )}
      {isInvalid && errorMessage && (
        <Field.Error match={true} render={<FieldError />}>
          {errorMessage}
        </Field.Error>
      )}
    </Field.Root>
  );
}
