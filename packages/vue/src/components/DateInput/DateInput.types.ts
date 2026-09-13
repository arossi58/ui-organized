import type { ControlSize } from "@ui-organized/core";

/**
 * Props for DateInput. `type` is fixed to `"date"`; every other native input
 * attribute (`name`, `placeholder`, `autocomplete`, …) falls through `$attrs`
 * onto the control.
 *
 * Written out rather than re-exporting the shared `DateFieldProps`, because a
 * component's own prop list is what `defineProps<T>()` compiles into runtime
 * declarations — and that list is the thing a consumer reads.
 */
export interface DateInputProps {
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
  /** The field's ISO value (`YYYY-MM-DD`). Use `v-model` for two-way binding. */
  modelValue?: string;
  /** Initial ISO value for uncontrolled usage. */
  defaultValue?: string;
  /** Earliest selectable date (ISO `YYYY-MM-DD`). */
  min?: string;
  /** Latest selectable date (ISO `YYYY-MM-DD`). */
  max?: string;
  /**
   * DOM element to teleport the calendar popover into. Defaults to `body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * so the popover inherits them instead of the document defaults.
   */
  portalContainer?: HTMLElement | null;
}
