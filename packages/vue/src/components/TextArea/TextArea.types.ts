import type { ControlSize } from "@ui-organized/core";

export interface TextAreaProps {
  /** The control's value. Use `v-model` for two-way binding. */
  modelValue?: string | number;
  /** Accessible label text rendered above the control. */
  label?: string;
  /**
   * Helper text rendered below the control. Hidden when an error is shown.
   * Commonly used as a character counter (e.g. "Characters 0/500").
   */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * Native resize affordance. Defaults to 'both' (horizontal resizing is capped
   * at the field's container width). Use 'vertical', 'horizontal', or 'none'.
   */
  resize?: "none" | "vertical" | "horizontal" | "both";
  /** Marks the control required. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
}
