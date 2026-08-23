import type { ControlSize } from "@ui-organized/core";

/**
 * The paired start/end values of a date range (ISO `YYYY-MM-DD` strings; `""`
 * when empty).
 */
export interface DateRangeValue {
  start: string;
  end: string;
}

export interface DateRangeInputProps {
  /** Accessible label rendered above the pair of controls. */
  label?: string;
  /** Helper text rendered below the controls. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the range invalid without a message.
   */
  error?: string | boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Marks both controls required and shows the required indicator. */
  required?: boolean;
  /** Disables both controls. */
  disabled?: boolean;

  /** The selected range. Use `v-model` for two-way binding. */
  modelValue?: DateRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateRangeValue;

  /** Earliest selectable date for both controls (ISO `YYYY-MM-DD`). */
  min?: string;
  /** Latest selectable date for both controls (ISO `YYYY-MM-DD`). */
  max?: string;

  /** `name` for the start control (form submission). */
  startName?: string;
  /** `name` for the end control (form submission). */
  endName?: string;
  /** Accessible label for the start control. Defaults to "Start date". */
  startLabel?: string;
  /** Accessible label for the end control. Defaults to "End date". */
  endLabel?: string;
  /**
   * Text rendered between the two controls. Defaults to an en dash. The
   * `separator` slot stands in for React's arbitrary `ReactNode`.
   */
  separator?: string;

  /**
   * DOM element to teleport the calendar popover into. Defaults to `body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * so the popover inherits them instead of the document defaults.
   */
  portalContainer?: HTMLElement | null;
}
