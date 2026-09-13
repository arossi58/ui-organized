import type { ControlSize } from "@ui-organized/core";

export interface NumberFieldProps {
  /**
   * Numeric value; `null` means empty. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` — Ark Vue names the
   * number-input machine's controlled value for `v-model`, and this package
   * follows Ark. The numeric-vs-string translation happens in the component.
   */
  modelValue?: number | null;
  /** Initial value for uncontrolled usage. */
  defaultValue?: number;
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
  size?: ControlSize;
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
}
