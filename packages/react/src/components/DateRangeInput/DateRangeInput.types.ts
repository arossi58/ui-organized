import type * as React from "react";

/** The paired start/end values of a date range (ISO `YYYY-MM-DD` strings; `""`
 *  when empty). */
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
  size?: "sm" | "md" | "lg";
  /** Marks both controls required and shows the required indicator. */
  required?: boolean;
  /** Disables both controls. */
  disabled?: boolean;

  /** Controlled value. Provide together with `onChange`. */
  value?: DateRangeValue;
  /** Uncontrolled initial value. */
  defaultValue?: DateRangeValue;
  /** Called with the full range whenever either end changes. */
  onChange?: (value: DateRangeValue) => void;

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
  /** Content rendered between the two controls. Defaults to an en dash. */
  separator?: React.ReactNode;

  /** Additional class applied to the group root. */
  className?: string;
  /** Id applied to the group root. */
  id?: string;
  /**
   * DOM element to portal the calendar popover into. Defaults to `document.body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * (rather than `<html>`) so the popover inherits them instead of falling back
   * to the document defaults.
   */
  portalContainer?: HTMLElement | null;
}
