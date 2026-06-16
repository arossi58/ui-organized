import { Toggle as BaseToggle } from "@base-ui-components/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui-components/react/toggle-group";
import { clsx } from "clsx";
import { toggleStyles } from "./Toggle.styles.js";
import { Icon } from "../Icon/index.js";
import type { ToggleProps, ToggleGroupProps } from "./Toggle.types.js";
import "./Toggle.css";

const ICON_SIZE = { sm: 14, md: 16, lg: 18 } as const;

/** A two-state button that can be on or off. */
export function Toggle({ size, icon, className, children, ...props }: ToggleProps) {
  const resolvedSize = size ?? "md";

  return (
    <BaseToggle className={clsx(toggleStyles({ size: resolvedSize }), className)} {...props}>
      {icon && <Icon name={icon} size={ICON_SIZE[resolvedSize]} />}
      {children}
    </BaseToggle>
  );
}

/** Groups a set of `<Toggle>` buttons, optionally as a single- or multi-select. */
export function ToggleGroup({ className, ...props }: ToggleGroupProps) {
  return <BaseToggleGroup className={clsx("toggle-group", className)} {...props} />;
}
