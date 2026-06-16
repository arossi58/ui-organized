export interface NumberFieldProps {
  /** Controlled numeric value. `null` means empty. */
  value?: number | null;
  /** Initial value for uncontrolled usage. */
  defaultValue?: number;
  /** Called when the value changes. */
  onValueChange?: (value: number | null) => void;
  /** Minimum allowed value. */
  min?: number;
  /** Maximum allowed value. */
  max?: number;
  /** Increment/decrement step. Defaults to 1. */
  step?: number;
  /** `Intl.NumberFormat` options for displaying the value (e.g. currency). */
  format?: Intl.NumberFormatOptions;
  /** Placeholder shown when empty. */
  placeholder?: string;
  /** Accessible label rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Whether the field should ignore user interaction. */
  disabled?: boolean;
  /** Whether the value can be edited. */
  readOnly?: boolean;
  /** Whether a value is required for form submission. */
  required?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Explicit id for the input (label association). Auto-generated otherwise. */
  id?: string;
  className?: string;
}
