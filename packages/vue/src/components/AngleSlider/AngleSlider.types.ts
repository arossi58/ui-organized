export interface AngleSliderProps {
  /** Accessible label text rendered above the dial. */
  label?: string;
  /** Helper text rendered below the dial. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /**
   * Controlled angle in degrees. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` — Ark Vue names the
   * angle-slider machine's controlled value for `v-model`, and this package
   * follows Ark.
   */
  modelValue?: number;
  /** Initial angle for the uncontrolled case. */
  defaultValue?: number;
  /** Degrees between allowed angles. Defaults to 1. */
  step?: number;
  /** Angles to mark around the dial, in degrees. */
  markers?: number[];
  /** Shows the current angle beside the label. Defaults to false. */
  showValue?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Disables the control. */
  disabled?: boolean;
  /** Renders the angle without interaction while keeping it focusable. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
}
