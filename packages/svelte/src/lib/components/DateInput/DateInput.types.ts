import type { HTMLInputAttributes } from "svelte/elements";
import type { ControlSize } from "@ui-organized/core";

/**
 * Props for DateInput. Native date-input props (`min`, `max`, `name`,
 * `oninput`, …) are inherited; `type` is fixed to `"date"`.
 *
 * Spelled out rather than re-exporting the shared `DateFieldProps`, because
 * `svelte-package` resolves each component's prop type on its own and an
 * interface it cannot see means no `.d.ts` at all — silently.
 */
export interface DateInputProps
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
  /** The field's ISO value (`YYYY-MM-DD`). Bindable: `bind:value`. */
  value?: string;
  /** Initial ISO value for uncontrolled usage. */
  defaultValue?: string;
  class?: string;
  /**
   * DOM element to portal the calendar popover into. Defaults to `document.body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * so the popover inherits them instead of the document defaults.
   */
  portalContainer?: HTMLElement | null;
}
