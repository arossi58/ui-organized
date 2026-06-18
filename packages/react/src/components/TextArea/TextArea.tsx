import { Field } from "@ark-ui/react";
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
        <Field.Label className="field__label">
          {label}
          {required && <span className="field__required" aria-hidden="true" />}
        </Field.Label>
      )}
      <Field.Textarea
        className="field__control textarea-field__control"
        required={required}
        data-resize={resize}
        {...textareaProps}
      />
      {helperText && !isInvalid && (
        <Field.HelperText className="field__description">
          {helperText}
        </Field.HelperText>
      )}
      {isInvalid && errorMessage && (
        <Field.ErrorText asChild>
          <FieldError>{errorMessage}</FieldError>
        </Field.ErrorText>
      )}
    </Field.Root>
  );
}
