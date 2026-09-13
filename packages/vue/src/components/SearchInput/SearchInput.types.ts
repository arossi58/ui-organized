import type { ControlSize } from "@ui-organized/core";

export interface SearchInputProps {
  /** The control's value. Use `v-model` for two-way binding. */
  modelValue?: string | number;
  /** Initial value for uncontrolled usage. */
  defaultValue?: string | number;
  /** Accessible label text rendered above the control. */
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
  /** Marks the control required. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /**
   * Show the clear (x) button while the field has a value. Defaults to `true`.
   * Works for both controlled and uncontrolled inputs.
   */
  clearable?: boolean;
}
