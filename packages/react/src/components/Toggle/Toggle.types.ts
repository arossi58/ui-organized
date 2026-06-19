import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { ToggleVariants } from "./Toggle.styles.js";

export interface ToggleProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Controlled pressed state (standalone usage). */
  pressed?: boolean;
  /** Initial pressed state for uncontrolled standalone usage. */
  defaultPressed?: boolean;
  /** Fired when the pressed state changes (standalone usage). */
  onPressedChange?: (pressed: boolean) => void;
  /** Identifies this toggle within a `<ToggleGroup>`; turns it into a group item. */
  value?: string;
  /** Size variant. Defaults to 'md'. */
  size?: ToggleVariants["size"];
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export interface ToggleGroupProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue"> {
  /** Controlled list of pressed values. */
  value?: string[];
  /** Initial pressed values for uncontrolled usage. */
  defaultValue?: string[];
  /** Fired when the set of pressed values changes. */
  onValueChange?: (value: string[]) => void;
  /** Allow more than one toggle pressed at once. Defaults to single-select. */
  multiple?: boolean;
  /** Disable the whole group. */
  disabled?: boolean;
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
}
