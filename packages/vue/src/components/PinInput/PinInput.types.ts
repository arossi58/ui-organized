export interface PinInputProps {
  /** Accessible label text rendered above the cells. */
  label?: string;
  /** Helper text rendered below the cells. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Number of cells. Defaults to 4. */
  length?: number;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Visual treatment of each cell. Defaults to 'default'. */
  variant?: "default" | "underline";
  /**
   * Controlled value, one character per cell. Characters beyond `length` are
   * ignored; a shorter string leaves the remaining cells empty. Use `v-model`
   * for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` — Ark Vue names the
   * pin-input machine's controlled value for `v-model`, and this package
   * follows Ark. The string-vs-array translation happens in the component.
   */
  modelValue?: string;
  /** Initial value for the uncontrolled case. */
  defaultValue?: string;
  /** Which characters each cell accepts. Defaults to 'numeric'. */
  type?: "numeric" | "alphanumeric" | "alphabetic";
  /** Renders entered characters as dots, like a password field. Defaults to false. */
  mask?: boolean;
  /**
   * Marks the cells as a one-time-code field so browsers and password managers
   * offer to autofill an SMS code. Defaults to false.
   */
  otp?: boolean;
  /** Placeholder character shown in each empty cell. Defaults to '○'. */
  placeholder?: string;
  /** Blurs the last cell once the value is complete. Defaults to false. */
  blurOnComplete?: boolean;
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables every cell. */
  disabled?: boolean;
  /** Makes the value read-only while keeping it focusable. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
}
