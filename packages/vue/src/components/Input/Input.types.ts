import type { ControlSize } from "@ui-organized/core";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface InputProps {
  /** The control's value. Use `v-model` for two-way binding. */
  modelValue?: string | number;
  /** Accessible label text rendered above the control. */
  label?: string;
  /** Helper text rendered below the control. Hidden when an error is shown. */
  helperText?: string;
  /**
   * Error state. Pass a string to show an error message.
   * Pass `true` to mark the field invalid without a message.
   */
  error?: string | boolean;
  /** Size variant. Defaults to 'md'. */
  size?: ControlSize;
  /** Marks the control required. */
  required?: boolean;
  /** Disables the control. */
  disabled?: boolean;
  /** An icon inside the control, before the text. */
  startIcon?: IconName | IconComponent;
  /** An icon inside the control, after the text. */
  endIcon?: IconName | IconComponent;
  /**
   * A text add-on before the control, inside its border: `https://`. For a
   * control of its own (a ghost `Select`, a `Button`), use the `start-addon` slot.
   */
  startAddon?: string;
  /** A text add-on after the control: `.com`. For a control, use the `end-addon` slot. */
  endAddon?: string;
}
