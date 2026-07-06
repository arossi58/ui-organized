import { clsx } from "clsx";
import type { ToolbarProps, ToolbarGroupProps } from "./Toolbar.types.js";
import "./Toolbar.css";

// Ark UI has no Toolbar primitive; Base UI's was a roving-focus container. The
// facade owns the accessible markup directly (role="toolbar"). It is a pure
// layout container — compose it with the library's own controls: `Button`
// (use `intent="ghost"`), `Input`, and `Divider` (use `orientation="vertical"`).
// Match the control `size` (sm/md/lg) across the children to size the toolbar.

/** A container grouping a set of design-system controls (buttons, inputs, dividers). */
export function Toolbar({ orientation = "horizontal", className, ...props }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-orientation={orientation}
      data-orientation={orientation}
      className={clsx("toolbar", className)}
      {...props}
    />
  );
}

/** Optional wrapper to visually cluster a subset of toolbar controls. */
export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <div role="group" className={clsx("toolbar__group", className)} {...props} />;
}
