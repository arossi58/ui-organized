export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Error message shown beneath the option. Puts the control in error state. */
  error?: string;
}

export interface RadioGroupProps {
  /** The selectable radio options. */
  options: RadioOption[];
  /** Selected value. Use `v-model` for two-way binding. */
  modelValue?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Group label rendered above the options. */
  label?: string;
  /** Layout direction of the radio items. Defaults to 'vertical'. */
  orientation?: "horizontal" | "vertical";
  /** Whether the entire group should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /**
   * Accessible name for the group when it has no visible `label`.
   *
   * Spelled `ariaLabel` — Vue camelises prop names declared through a type, so a
   * prop named `"aria-label"` is never populated. Templates still write
   * `aria-label="..."`.
   */
  ariaLabel?: string;
}
