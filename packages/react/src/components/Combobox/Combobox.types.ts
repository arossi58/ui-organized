export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ComboboxBaseProps {
  /** Selectable options. The list filters against each option's `label`. */
  options: ComboboxOption[];
  /** Controlled open state of the dropdown. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the dropdown opens or closes. */
  onOpenChange?: (open: boolean) => void;
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

/** One choice. The default. */
export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  /** Controlled selected value; with `multiple`, the selected values. */
  value?: string;
  /** Initial selected value for uncontrolled usage; with `multiple`, the initial values. */
  defaultValue?: string;
  /** Called with the selected option's value (empty string when cleared); with `multiple`, with every selected value. */
  onValueChange?: (value: string) => void;
}

/**
 * Any number of choices, shown as tags before the text box, with a "+N" for
 * those that do not fit and a button that clears them all. Picking clears the
 * query and keeps the list open; Backspace in an empty box removes the last
 * value. Each value is submitted as its own hidden input named `name`.
 */
export interface ComboboxMultipleProps extends ComboboxBaseProps {
  /**
   * Any number of choices, as tags before the text box. `value`,
   * `defaultValue` and `onValueChange` then take `string[]`.
   */
  multiple: true;
  /** Controlled selected values. */
  value?: string[];
  /** Initial selected values for uncontrolled usage. */
  defaultValue?: string[];
  /** Callback fired when the selection changes. */
  onValueChange?: (value: string[]) => void;
  /** The clear-all button's accessible name. Defaults to "Clear all". */
  clearLabel?: string;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;
