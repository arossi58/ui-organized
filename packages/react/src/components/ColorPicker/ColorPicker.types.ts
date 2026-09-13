import type { RefObject } from "react";

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
   * Controlled colour, as a CSS colour string — `#2563eb`, `rgb(37 99 235)`,
   * `hsl(221 83% 53%)`. The machine works in parsed `Color` objects; the
   * conversion happens at this boundary.
   */
  value?: string;
  /** Initial colour for the uncontrolled case. Defaults to '#000000'. */
  defaultValue?: string;
  /** Called continuously as the colour changes, with a CSS colour string. */
  onValueChange?: (value: string) => void;
  /** Called once the interaction ends. */
  onValueChangeEnd?: (value: string) => void;
  /**
   * The notation this component *emits* — what `value`, `onValueChange`,
   * `onValueChangeEnd`, the trigger's value text and the hidden form input all
   * use. Defaults to 'rgba'.
   *
   * It also picks which notation the picker's inputs open on. It does not pin
   * them there: a reader can switch the inputs to any notation without changing
   * what this component hands back, which stays whatever this names.
   */
  format?: "rgba" | "hsla" | "hsba" | "hex" | "oklch";
  /** Preset swatches offered under the picker area. */
  swatches?: string[];
  /** Shows the eyedropper button, where the browser supports it. Defaults to true. */
  showEyeDropper?: boolean;
  /**
   * Shows the notation select and its channel fields — HEX, RGB, HSL, OKLCH —
   * under the sliders. Defaults to true. Turn it off for a picker meant to be
   * driven by eye rather than by number.
   */
  showFormatInputs?: boolean;
  /** Controlled open state of the picker. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Called when the picker opens or closes. */
  onOpenChange?: (open: boolean) => void;
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
  /** Portal target for the picker surface. Defaults to the document body. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
}
