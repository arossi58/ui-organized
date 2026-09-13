export interface CheckboxProps {
  /** Whether the control is checked. Use `v-model:checked` for two-way binding. */
  checked?: boolean;
  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;
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
  /**
   * Accessible name when the control is rendered without a visible `label`.
   *
   * Spelled `ariaLabel`, not `"aria-label"`, because Vue camelises prop names
   * declared through a type — a prop literally named `aria-label` is compiled to
   * `ariaLabel` and the quoted key is never populated. Templates still write
   * `aria-label="..."`; Vue maps it here.
   */
  ariaLabel?: string;
}
