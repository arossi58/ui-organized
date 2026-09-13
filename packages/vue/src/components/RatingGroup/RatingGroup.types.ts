import type { ControlSize } from "@ui-organized/core";

export interface RatingGroupProps {
  /** Accessible label text rendered above the stars. */
  label?: string;
  /** Helper text rendered below the stars. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Number of rating items. Defaults to 5. */
  count?: number;
  /**
   * Controlled rating. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` — Ark Vue names the
   * rating-group machine's controlled value for `v-model`, and this package
   * follows Ark.
   */
  modelValue?: number;
  /** Initial rating for the uncontrolled case. */
  defaultValue?: number;
  /** Allows half-star ratings. Defaults to false. */
  allowHalf?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Colour of the filled stars. Defaults to 'default'. */
  variant?: "default" | "warning";
  /** Renders the rating without interaction while keeping it readable. */
  readOnly?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
}
