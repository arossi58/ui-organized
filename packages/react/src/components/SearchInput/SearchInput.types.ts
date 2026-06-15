import type * as React from "react";

export interface SearchInputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "size" | "type"> {
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
  size?: "sm" | "md" | "lg";
  /**
   * Show the clear (×) button while the field has a value. Defaults to `true`.
   * Works for both controlled and uncontrolled inputs.
   */
  clearable?: boolean;
  /** Called after the field is cleared via the clear button. */
  onClear?: () => void;
}
