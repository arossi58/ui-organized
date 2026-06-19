import { clsx } from "clsx";
import { Icon } from "../Icon/index.js";
import type {
  ToolbarProps,
  ToolbarGroupProps,
  ToolbarButtonProps,
  ToolbarLinkProps,
  ToolbarInputProps,
  ToolbarSeparatorProps,
} from "./Toolbar.types.js";
import "./Toolbar.css";

// Ark UI has no Toolbar primitive; Base UI's was a roving-focus container. The
// facade owns the accessible markup directly (role="toolbar"); arrow-key roving
// focus between items is not coordinated — each control is individually tabbable.

/** A container grouping a set of controls (buttons, links, inputs). */
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

export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <div role="group" className={clsx("toolbar__group", className)} {...props} />;
}

export function ToolbarButton({ icon, type = "button", className, children, ...props }: ToolbarButtonProps) {
  return (
    <button type={type} className={clsx("toolbar__button", className)} {...props}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

export function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  return <a className={clsx("toolbar__button", "toolbar__link", className)} {...props} />;
}

export function ToolbarInput({ className, ...props }: ToolbarInputProps) {
  return <input className={clsx("toolbar__input", className)} {...props} />;
}

export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return (
    <div role="separator" className={clsx("toolbar__separator", className)} {...props} />
  );
}
