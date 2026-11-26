import type { ControlSize } from "@ui-organized/core";
export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  /**
   * Any number of choices: tags before the text box with a "+N" for those
   * that do not fit, and a button that clears them all. The list stays open
   * and the query clears after each pick; Backspace in an empty box removes
   * the last value. The chosen values travel on their own model,
   * `v-model:values`, as on Select. Each value is submitted as its own hidden
   * input under `name`, and a multiple combobox cannot be `required`.
   */
  multiple?: boolean;
  /** With `multiple`: the chosen values. Use `v-model:values`. */
  values?: string[];
  /** With `multiple`: the initial values for uncontrolled usage. */
  defaultValues?: string[];
  /** With `multiple`: the clear-all button's accessible name. Defaults to "Clear all". */
  clearLabel?: string;
  /** Selectable options. The list filters against each option's `label`. */
  options: ComboboxOption[];
  /** Selected value. Use `v-model` for two-way binding. */
  modelValue?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Called with the selected option's value (empty string when cleared). */
  onValueChange?: (value: string) => void;
  /** Open state of the dropdown. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the dropdown opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Placeholder shown in the search input when nothing is selected. */
  placeholder?: string;
  /** Accessible label rendered above the control. */
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
  /** Whether the field should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Whether a value is required for form submission. */
  required?: boolean;
  /** Message shown when no option matches the query. */
  emptyMessage?: string;
  /** DOM element to portal the dropdown into. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}
