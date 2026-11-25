import type * as React from "react";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface InputProps
  extends Omit<React.ComponentPropsWithRef<"input">, "size"> {
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
  size?: "sm" | "md" | "lg";
  /** An icon inside the control, before the text: a search glass, an at sign. */
  startIcon?: IconName | IconComponent;
  /** An icon inside the control, after the text. */
  endIcon?: IconName | IconComponent;
  /**
   * An add-on before the control, inside its border: text such as `https://`,
   * or a control of its own, such as a ghost `Select` or a `Button`.
   */
  startAddon?: React.ReactNode;
  /** An add-on after the control: text such as `.com`, or a control of its own. */
  endAddon?: React.ReactNode;
}
