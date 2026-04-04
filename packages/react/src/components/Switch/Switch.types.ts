export interface SwitchProps {
  /** Whether the switch is currently on (controlled). */
  checked?: boolean;
  /** Initial state for uncontrolled usage. */
  defaultChecked?: boolean;
  /** Callback fired when the switch state changes. */
  onCheckedChange?: (checked: boolean) => void;
  /** Label text rendered beside the switch. */
  label?: string;
  /** Whether the switch should ignore user interaction. */
  disabled?: boolean;
  /** Whether the switch is required for form submission. */
  required?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** ID for the switch element. */
  id?: string;
  className?: string;
}
