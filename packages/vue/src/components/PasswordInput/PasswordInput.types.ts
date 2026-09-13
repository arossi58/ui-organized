import type { ControlSize } from "@ui-organized/core";

export interface PasswordInputProps {
  /** The control's value. Use `v-model` for two-way binding. */
  modelValue?: string | number;
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
  /** Show the show/hide visibility toggle. Defaults to `true`. */
  showToggle?: boolean;
}
