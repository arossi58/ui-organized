import type { RefObject } from "react";

export interface DatePickerProps {
  /** Accessible label rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /**
   * Controlled value as ISO dates (`YYYY-MM-DD`). An array even in single mode,
   * because `range` selects two — the machine works in parsed calendar dates and
   * the conversion happens at this boundary.
   */
  value?: string[];
  /** Initial value for the uncontrolled case, as ISO dates. */
  defaultValue?: string[];
  /** Called with the new ISO dates whenever the selection changes. */
  onValueChange?: (value: string[]) => void;
  /** How many dates may be picked. Defaults to 'single'. */
  selectionMode?: "single" | "multiple" | "range";
  /** Earliest selectable date, as an ISO date. */
  min?: string;
  /** Latest selectable date, as an ISO date. */
  max?: string;
  /** Months shown side by side. Defaults to 1. */
  numOfMonths?: number;
  /** BCP-47 locale driving month names, weekday order and formatting. */
  locale?: string;
  /** Controlled open state of the calendar. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Called when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Control treatment. `ghost` drops the field chrome. Defaults to 'default'. */
  variant?: "default" | "ghost";
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Makes the value read-only while keeping the control focusable. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
  /** Portal target for the calendar surface. Defaults to the document body. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
}
