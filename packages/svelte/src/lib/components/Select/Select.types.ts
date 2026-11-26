import type { ControlSize } from "@ui-organized/core";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<M extends boolean = false> {
  /**
   * Any number of choices: tags on one line with a "+N" for those that do not
   * fit, and a button that clears them all. The list stays open while choosing.
   * The component is generic on it, so `value` and `onValueChange` are typed
   * `string` or `string[]` to match, and leaving it off keeps the single form.
   * A ghost select is single only.
   */
  multiple?: M;
  /** Selectable options. */
  options: SelectOption[];
  /** Selected value. Bindable: `bind:value`. */
  value?: M extends true ? string[] : string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: M extends true ? string[] : string;
  /** Callback fired when the selected value changes. */
  onValueChange?: (value: M extends true ? string[] : string) => void;
  /** Open state of the dropdown. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the dropdown opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder text shown when nothing is selected. */
  placeholder?: string;
  /** Accessible label rendered above the trigger. */
  label?: string;
  /** Helper text rendered below the trigger. Hidden when error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /**
   * Visual variant. Defaults to 'default'. `'ghost'` renders a borderless,
   * label-less trigger that mirrors the ghost Button's color states.
   */
  variant?: M extends true ? "default" : "default" | "ghost";
  /** Whether the select should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Whether a value is required for form submission. */
  required?: boolean;
  class?: string;
  /**
   * DOM element to portal the dropdown popup into. Defaults to `document.body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * so the popup inherits them instead of the document defaults.
   */
  portalContainer?: HTMLElement | null;
  /** With `multiple`: the clear-all button's accessible name. Defaults to "Clear all". */
  clearLabel?: string;
}
