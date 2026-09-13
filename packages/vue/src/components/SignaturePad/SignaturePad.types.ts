import type { ControlSize } from "@ui-organized/core";

export interface SignaturePadProps {
  /** Accessible label rendered above the pad. */
  label?: string;
  /** Helper text rendered below the pad. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /**
   * Controlled strokes, as SVG path data. Use `v-model:paths` for two-way
   * binding — Ark Vue names this one `paths` rather than `modelValue`, and this
   * package follows Ark.
   */
  paths?: string[];
  /** Initial strokes for the uncontrolled case. */
  defaultPaths?: string[];
  /**
   * Ink width in device pixels. This is a canvas stroke, not CSS — the ink's
   * *colour* is themed, its thickness is geometry. Defaults to 2.
   */
  strokeWidth?: number;
  /** Shows the sign-here rule across the pad. Defaults to true. */
  showGuide?: boolean;
  /** Shows the clear button. Defaults to true. */
  showClear?: boolean;
  /** Text on the clear button. Defaults to 'Clear'. */
  clearLabel?: string;
  /** Size variant, driving the pad's height. Defaults to 'md'. */
  size?: ControlSize;
  /** Surface treatment. `bordered` draws a full box. Defaults to 'default'. */
  variant?: "default" | "bordered";
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables drawing. */
  disabled?: boolean;
  /** Makes the signature read-only while keeping it visible. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
}
