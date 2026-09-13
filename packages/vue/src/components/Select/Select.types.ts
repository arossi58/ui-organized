import type { ControlSize } from "@ui-organized/core";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
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
   * label-less trigger that mirrors the ghost Button's colour states.
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
