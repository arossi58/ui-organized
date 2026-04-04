export interface CheckboxProps {
  /** Whether the checkbox is currently checked (controlled). */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Callback fired when checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Label text rendered beside the checkbox. */
  label?: string;
  /** Whether the checkbox is in an indeterminate state. */
  indeterminate?: boolean;
  /** Whether the checkbox should ignore user interaction. */
  disabled?: boolean;
  /** Whether the checkbox is required for form submission. */
  required?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** ID for the input element. */
  id?: string;
  className?: string;
}
