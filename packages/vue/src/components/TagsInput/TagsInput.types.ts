export interface TagsInputProps {
  /** Accessible label text rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /**
   * Controlled list of tags. Use `v-model` for two-way binding.
   *
   * Spelled `modelValue` rather than React's `value` — Ark Vue names the
   * tags-input machine's controlled value for `v-model`, and this package
   * follows Ark.
   */
  modelValue?: string[];
  /** Initial tags for the uncontrolled case. */
  defaultValue?: string[];
  /** Placeholder shown in the entry field. */
  placeholder?: string;
  /** Size variant. Defaults to 'md'. */
  size?: "sm" | "md" | "lg";
  /** Maximum number of tags. Further entries are rejected once reached. */
  max?: number;
  /** Allows a double-click to edit an existing tag in place. Defaults to true. */
  editable?: boolean;
  /** Splits pasted or typed text into several tags. Defaults to ','. */
  delimiter?: string;
  /** Creates tags from pasted text. Defaults to false. */
  addOnPaste?: boolean;
  /** Marks the field required and shows the required indicator. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** Makes the tags read-only while keeping them focusable. */
  readOnly?: boolean;
  /** Form field name for the hidden inputs. */
  name?: string;
}
