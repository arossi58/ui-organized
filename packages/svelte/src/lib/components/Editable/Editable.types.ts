export interface EditableProps {
  /** Accessible label text rendered above the value. */
  label?: string;
  /** Helper text rendered below the value. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Controlled value. Bindable: `bind:value`. */
  value?: string;
  /** Initial value for the uncontrolled case. */
  defaultValue?: string;
  /** Called on every keystroke while editing. */
  onValueChange?: (value: string) => void;
  /** Called when the edit is committed — on submit, or on blur in blur mode. */
  onValueCommit?: (value: string) => void;
  /** Text shown when the value is empty. */
  placeholder?: string;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** What starts an edit. Defaults to 'focus'. */
  activationMode?: "focus" | "dblclick" | "click" | "none";
  /** What commits an edit. Defaults to 'blur'. */
  submitMode?: "blur" | "enter" | "both" | "none";
  /** Shows explicit edit / submit / cancel buttons. Defaults to false. */
  showControls?: boolean;
  /** Grows the input to fit its content instead of filling the width. */
  autoResize?: boolean;
  /** Maximum number of characters. */
  maxLength?: number;
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Makes the value read-only, so no edit can be started. */
  readOnly?: boolean;
  /** Form field name for the input. */
  name?: string;
  class?: string;
}
