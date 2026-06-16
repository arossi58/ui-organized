import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { Toggle as BaseToggle } from "@base-ui-components/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui-components/react/toggle-group";
import type { ToggleVariants } from "./Toggle.styles.js";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export interface ToggleProps
  extends Omit<React.ComponentProps<typeof BaseToggle>, "className">,
    StringClassName {
  /** Size variant. Defaults to 'md'. */
  size?: ToggleVariants["size"];
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export type ToggleGroupProps = Omit<
  React.ComponentProps<typeof BaseToggleGroup>,
  "className"
> &
  StringClassName;
