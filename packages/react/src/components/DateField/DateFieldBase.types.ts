import type * as React from "react";

/** Props shared by the single date/time fields (DateInput, DateTimeInput). */
export interface DateFieldProps
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
}

/** Internal props for the shared base — adds the native input type and the
 *  accessible label for the leading picker button. */
export interface DateFieldBaseProps extends DateFieldProps {
  /** Native input type rendered on the field surface. */
  type: "date" | "datetime-local";
  /** Accessible label for the leading calendar button. */
  pickerLabel: string;
}
