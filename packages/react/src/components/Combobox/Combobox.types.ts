export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboboxProps {
  /** Selectable options. The list filters against each option's `label`. */
  options: ComboboxOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Called with the selected option's value (empty string when cleared). */
  onValueChange?: (value: string) => void;
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
  size?: "sm" | "md" | "lg";
  /** Whether the field should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Whether a value is required for form submission. */
  required?: boolean;
  className?: string;
  /** Message shown when no option matches the query. */
  emptyMessage?: string;
  /** DOM element to portal the dropdown into. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}
