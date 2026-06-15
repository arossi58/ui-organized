import type * as React from "react";

export interface PasswordInputProps
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
  /** Show the show/hide visibility toggle. Defaults to `true`. */
  showToggle?: boolean;
}
