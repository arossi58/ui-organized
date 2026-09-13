export interface ListboxOption {
  /** Form value submitted when the option is selected. */
  value: string;
  /** Display text. */
  label: string;
  /** Prevents selection while keeping the option visible. */
  disabled?: boolean;
  /** Group heading this option belongs under. Options sharing a group render together. */
  group?: string;
}

export interface ListboxProps {
  /** The options to list, in display order. */
  options: ListboxOption[];
  /** Accessible label rendered above the list. */
  label?: string;
  /** Selected values. Bindable: `bind:value`. */
  value?: string[];
  /** Initial selection for the uncontrolled case. */
  defaultValue?: string[];
  /** Called with the full selection whenever it changes. */
  onValueChange?: (value: string[]) => void;
  /**
   * How many options may be selected at once. `extended` adds shift-click and
   * shift-arrow range selection. Defaults to 'single'.
   */
  selectionMode?: "single" | "multiple" | "extended";
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Visual treatment. `bordered` draws a container around the list. Defaults to 'default'. */
  variant?: "default" | "bordered";
  /** Message shown when `options` is empty. */
  emptyMessage?: string;
  /** Disables the whole list. */
  disabled?: boolean;
  class?: string;
}
