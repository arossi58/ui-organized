export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Selectable options. */
  options: SelectOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when the selected value changes. */
  onValueChange?: (value: string) => void;
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
  size?: "sm" | "md" | "lg";
  /** Whether the select should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Whether a value is required for form submission. */
  required?: boolean;
  className?: string;
}
