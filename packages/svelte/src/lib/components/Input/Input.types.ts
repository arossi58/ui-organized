import type { HTMLInputAttributes } from "svelte/elements";
import type { ControlSize } from "@ui-organized/core";
import type { Snippet } from "svelte";
import type { ArkForwardable } from "../../types.js";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface InputProps
  extends ArkForwardable<Omit<HTMLInputAttributes, "size" | "class">> {
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
  class?: string;
  /** The control's value. Bindable: `bind:value`. */
  value?: string | number | null;
  /** An icon inside the control, before the text. */
  startIcon?: IconName | IconComponent;
  /** An icon inside the control, after the text. */
  endIcon?: IconName | IconComponent;
  /**
   * An add-on before the control, inside its border: text such as `https://`,
   * or a snippet holding a control of its own, such as a ghost `Select`.
   */
  startAddon?: string | Snippet;
  /** An add-on after the control: text such as `.com`, or a snippet. */
  endAddon?: string | Snippet;
}
