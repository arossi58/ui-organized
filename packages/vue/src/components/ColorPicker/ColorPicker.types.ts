export interface ColorPickerProps {
  /** Accessible label rendered above the trigger. */
  label?: string;
  /** Helper text rendered below the trigger. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /**
   * Controlled colour as a CSS colour string — `#2563eb`, `rgb(37 99 235)`,
   * `hsl(221 83% 53%)`. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value`: Ark Vue names the
   * colour-picker machine's controlled value for `v-model`, and this package
   * follows Ark. The machine works in parsed `Color` objects; the conversion
   * happens at this boundary.
   */
  modelValue?: string;
  /** Initial colour for the uncontrolled case. Defaults to '#000000'. */
  defaultValue?: string;
  /** Which notation the channel inputs use. Defaults to 'rgba'. */
  format?: "rgba" | "hsla" | "hsba";
  /** Preset swatches offered under the picker area. */
  swatches?: string[];
  /** Shows the eyedropper button, where the browser supports it. Defaults to true. */
  showEyeDropper?: boolean;
  /** Open state of the picker. Use `v-model:open` for two-way binding. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Trigger treatment. `swatch-only` drops the value text. Defaults to 'default'. */
  variant?: "default" | "swatch-only";
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Makes the colour read-only while keeping the trigger focusable. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
  /** DOM element to teleport the picker surface into. Defaults to `body`. */
  container?: HTMLElement | null;
}
