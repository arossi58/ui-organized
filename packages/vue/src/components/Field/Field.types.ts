export interface FieldProps {
  /** Marks the field invalid (drives error display + `data-invalid`). */
  invalid?: boolean;
  /** Disables the field's control. */
  disabled?: boolean;
  /** Marks the field's control required. */
  required?: boolean;
  /** Marks the field's control read-only. */
  readOnly?: boolean;
  /** Arrangement of label and control. Defaults to 'stacked'. */
  layout?: "stacked" | "inline";
}

export interface FieldErrorMessageProps {
  /** Message as a plain string — see FieldError for why a slot is not enough. */
  message?: string;
}
