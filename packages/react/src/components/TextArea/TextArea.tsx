import { Field } from "@base-ui-components/react/field";
import { clsx } from "clsx";
import { textAreaFieldStyles } from "./TextArea.styles.js";
import { FieldError } from "../FieldError/index.js";
import type { TextAreaProps } from "./TextArea.types.js";
// Shares the Input field surface/state styling; TextArea.css layers on the
// multi-line specifics (min-height, resize).
import "../Input/Input.css";
import "./TextArea.css";

export function TextArea({
  label,
  helperText,
  error,
  size,
  resize = "both",
  required,
  className,
  ...textareaProps
}: TextAreaProps) {
  const isInvalid = !!error;
  const errorMessage = typeof error === "string" ? error : undefined;

  return (
    <Field.Root
      className={clsx(textAreaFieldStyles({ size }), className)}
      invalid={isInvalid}
    >
      {label && (
        <Field.Label className="input-field__label">
          {label}
          {required && <span className="input-field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <Field.Control
        render={<textarea {...textareaProps} data-resize={resize} />}
        className="input-field__control textarea-field__control"
        required={required}
      />
      {helperText && !isInvalid && (
        <Field.Description className="input-field__description">
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
