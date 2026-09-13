import type { HTMLTextareaAttributes } from "svelte/elements";
import type { ControlSize } from "@ui-organized/core";
import type { ArkForwardable } from "../../types.js";

export interface TextAreaProps
  extends ArkForwardable<Omit<HTMLTextareaAttributes, "class">> {
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
   * at the field's container width). Use 'vertical', 'horizontal', or 'none' to
   * constrain it.
   */
  resize?: "none" | "vertical" | "horizontal" | "both";
  class?: string;
  /** The control's value. Bindable: `bind:value`. */
  value?: string | number | null;
}
