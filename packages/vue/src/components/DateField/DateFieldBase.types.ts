import type { ControlSize } from "@ui-organized/core";

/** Props shared by the single date/time fields (DateInput, DateTimeInput). */
export interface DateFieldProps {
  /** Accessible label text rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Marks the control required and shows the required indicator. */
  required?: boolean;
  /** Disables the control and its picker button. */
  disabled?: boolean;
  /** The field's ISO value. Use `v-model` for two-way binding. */
  modelValue?: string;
  /** Initial ISO value for uncontrolled usage. */
  defaultValue?: string;
  /** Earliest selectable date, as an ISO string. */
  min?: string;
  /** Latest selectable date, as an ISO string. */
  max?: string;
  /**
   * DOM element to teleport the calendar popover into. Defaults to `body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * (rather than `<html>`) so the popover inherits them instead of falling back
   * to the document defaults.
   */
  portalContainer?: HTMLElement | null;
}

/**
 * Internal props for the shared base — adds the native input type and the
 * accessible label for the leading picker button.
 */
export interface DateFieldBaseProps extends DateFieldProps {
  /** Native input type rendered on the field surface. */
  type: "date" | "datetime-local";
  /** Accessible label for the leading calendar button. */
  pickerLabel: string;
}
