export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectBaseProps {
  /** Selectable options. */
  options: SelectOption[];
  /** Controlled open state of the dropdown. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the dropdown opens or closes. */
  onOpenChange?: (open: boolean) => void;
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
  /**
   * Visual variant. Defaults to 'default'. `'ghost'` renders a borderless,
   * label-less trigger that mirrors the ghost Button's color states (same
   * sizes and functionality otherwise). When `label` is set on a ghost select
   * it is applied as the trigger's `aria-label` rather than shown.
   */
  variant?: "default" | "ghost";
  /** Whether the select should ignore user interaction. */
  disabled?: boolean;
  /** Name attribute for form submission. */
  name?: string;
  /** Whether a value is required for form submission. */
  required?: boolean;
  className?: string;
  /**
   * DOM element to portal the dropdown popup into. Defaults to `document.body`.
   * Set this to a themed container when theme variables are scoped to a subtree
   * (rather than `<html>`) so the popup inherits them instead of falling back to
   * the document defaults.
   */
  portalContainer?: HTMLElement | null;
}

/** One choice. The default. */
export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false;
  /** Controlled selected value; with `multiple`, the selected values. */
  value?: string;
  /** Initial selected value for uncontrolled usage; with `multiple`, the initial values. */
  defaultValue?: string;
  /** Callback fired when the selected value changes; with `multiple`, called with every selected value. */
  onValueChange?: (value: string) => void;
}

/**
 * Any number of choices, shown as tags on one line with a "+N" for those that
 * do not fit, and a button that clears them all. The list stays open while
 * choosing. A ghost select hugs its content, so it is single only.
 */
export interface SelectMultipleProps extends Omit<SelectBaseProps, "variant"> {
  /**
   * Any number of choices, as tags on one line. `value`, `defaultValue` and
   * `onValueChange` then take `string[]`.
   */
  multiple: true;
  variant?: "default";
  /** Controlled selected values. */
  value?: string[];
  /** Initial selected values for uncontrolled usage. */
  defaultValue?: string[];
  /** Callback fired when the selection changes. */
  onValueChange?: (value: string[]) => void;
  /** The clear-all button's accessible name. Defaults to "Clear all". */
  clearLabel?: string;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;
