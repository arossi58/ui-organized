import type { HTMLInputAttributes } from "svelte/elements";
import type { ControlSize } from "@ui-organized/core";

/**
 * Props shared by the single date/time fields (DateInput, DateTimeInput).
 *
 * Written out in full rather than sharing a private base interface:
 * `svelte-package` emits no `.d.ts` for a component whose props reference a type
 * it cannot resolve, and it does so silently — the component ships untyped.
 */
export interface DateFieldProps
  extends Omit<HTMLInputAttributes, "size" | "type" | "class" | "value"> {
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
  /** The field's ISO value (`YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm`). Bindable. */
  value?: string;
  /** Initial ISO value for uncontrolled usage. */
  defaultValue?: string;
  class?: string;
  /**
   * DOM element to portal the calendar popover into. Defaults to `document.body`.
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
