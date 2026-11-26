import type { ControlSize } from "@ui-organized/core";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /**
   * Any number of choices: tags on one line with a "+N" for those that do not
   * fit, and a button that clears them all. The list stays open while choosing.
   * The chosen values travel on their own model, `v-model:values`, as on
   * Angular's UioSelect: widening `modelValue` to `string | string[]` would
   * break every typed `@value-change` handler. A ghost select is single only.
   */
  multiple?: boolean;
  /** With `multiple`: the chosen values. Use `v-model:values`. */
  values?: string[];
  /** With `multiple`: the initial values for uncontrolled usage. */
  defaultValues?: string[];
  /** With `multiple`: the clear-all button's accessible name. Defaults to "Clear all". */
  clearLabel?: string;
  /** Selectable options. */
  options: SelectOption[];
  /** Selected value. Use `v-model` for two-way binding. */
  modelValue?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Open state of the dropdown. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
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
  variant?: "default" | "ghost";
  /** Whether the select should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Whether a value is required for form submission. */
  required?: boolean;
  /** DOM element to teleport the dropdown popup into. Defaults to `body`. */
  portalContainer?: HTMLElement | null;
}
