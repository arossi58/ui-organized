/**
 * Written out in full rather than extending a shared base.
 *
 * `svelte-package` emits no `.d.ts` for a component whose props type extends an
 * interface it cannot see from the outside, and the failure is silent: the build
 * succeeds and consumers get `any`. Every exported prop interface in this
 * package therefore states its own members.
 */
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
   * Colour as a CSS colour string — `#2563eb`, `rgb(37 99 235)`,
   * `hsl(221 83% 53%)`. The machine works in parsed `Color` objects; the
   * conversion happens at this boundary. Bindable: `bind:value`.
   */
  value?: string;
  /** Initial colour for the uncontrolled case. Defaults to '#000000'. */
  defaultValue?: string;
  /** Called continuously as the colour changes, with a CSS colour string. */
  onValueChange?: (value: string) => void;
  /** Called once the interaction ends. */
  onValueChangeEnd?: (value: string) => void;
  /**
   * The notation the colour is held and printed in — the value string, the
   * trigger's value text and the hidden form input. Defaults to 'rgba'.
   *
   * It also picks which notation the picker's fields open on. It does not pin
   * them there: a reader can switch the fields to any notation without changing
   * what this component hands back, which stays whatever this names.
   */
  format?: "rgba" | "hsla" | "hsba";
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
  /** Open state of the picker. Bindable: `bind:open`. */
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
  /** Portal container for the picker surface. Defaults to document.body. */
  container?: HTMLElement | null;
  class?: string;
}
