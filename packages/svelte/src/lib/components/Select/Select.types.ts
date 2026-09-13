import type { ControlSize } from "@ui-organized/core";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Selectable options. */
  options: SelectOption[];
  /** Selected value. Bindable: `bind:value`. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the selected value changes. */
  onValueChange?: (value: string) => void;
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
   * label-less trigger that mirrors the ghost Button's colour states.
   */
  variant?: "default" | "ghost";
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
}
