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
  /** Controlled rating. Bindable: `bind:value`. */
  value?: number;
  /** Initial rating for the uncontrolled case. */
  defaultValue?: number;
  /** Called with the new rating whenever it changes. */
  onValueChange?: (value: number) => void;
  /** Allows half-star ratings. Defaults to false. */
  allowHalf?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
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
  class?: string;
}
