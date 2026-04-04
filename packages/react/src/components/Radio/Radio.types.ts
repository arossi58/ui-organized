export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** The selectable radio options. */
  options: RadioOption[];
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value for uncontrolled usage. */
  defaultValue?: string;
  /** Callback fired when selection changes. */
  onValueChange?: (value: string) => void;
  /** Group label rendered above the options. */
  label?: string;
  /** Layout direction of the radio items. Defaults to 'vertical'. */
  orientation?: "horizontal" | "vertical";
  /** Whether the entire group should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  className?: string;
}
