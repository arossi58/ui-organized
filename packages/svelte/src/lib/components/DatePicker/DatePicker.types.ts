import type { ControlSize } from "@ui-organized/core";

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
   * Selected value as ISO dates (`YYYY-MM-DD`). An array even in single mode,
   * because `range` selects two — the machine works in parsed calendar dates and
   * the conversion happens at this boundary. Bindable: `bind:value`.
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
  /** Open state of the calendar. Bindable: `bind:open`. */
  open?: boolean;
  /** Initial open state for the uncontrolled case. */
  defaultOpen?: boolean;
  /** Called when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
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
  /**
   * DOM element to portal the calendar surface into. Defaults to `document.body`.
   *
   * React spells this `container` and takes a ref object, because that is what
   * its `<Portal>` wants. Svelte's takes the element, so it is named the way
   * every other portalled control in this package names it.
   */
  portalContainer?: HTMLElement | null;
  class?: string;
}
