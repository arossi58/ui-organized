export interface AngleSliderProps {
  /** Accessible label text rendered above the dial. */
  label?: string;
  /** Helper text rendered below the dial. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Controlled angle in degrees, 0–360. */
  value?: number;
  /** Initial angle in degrees for the uncontrolled case. */
  defaultValue?: number;
  /** Called continuously as the dial is dragged. */
  onValueChange?: (value: number) => void;
  /** Called once, when the drag ends. */
  onValueChangeEnd?: (value: number) => void;
  /** Degrees per keyboard step. Defaults to 1. */
  step?: number;
  /** Tick marks in degrees, e.g. `[0, 90, 180, 270]`. */
  markers?: number[];
  /** Shows the current angle beside the label. Defaults to false. */
  showValue?: boolean;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Disables the control. */
  disabled?: boolean;
  /** Makes the angle read-only while keeping it focusable. */
  readOnly?: boolean;
  /** Form field name for the hidden input. */
  name?: string;
  className?: string;
}
