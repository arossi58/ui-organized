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
  /**
   * Selected values. Use `v-model` for two-way binding.
   *
   * Spelled `value` in the React library. Ark Vue renames the Listbox machine's
   * controlled value to `modelValue`, and this package follows Ark rather than
   * translating — the same rename Select and Progress carry.
   */
  modelValue?: string[];
  /** Initial selection for the uncontrolled case. */
  defaultValue?: string[];
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
}
