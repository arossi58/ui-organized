import { Toolbar as BaseToolbar } from "@base-ui-components/react/toolbar";
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

/** A container grouping a set of controls (buttons, links, inputs). */
export function Toolbar({ className, ...props }: ToolbarProps) {
  return <BaseToolbar.Root className={clsx("toolbar", className)} {...props} />;
}

export function ToolbarGroup({ className, ...props }: ToolbarGroupProps) {
  return <BaseToolbar.Group className={clsx("toolbar__group", className)} {...props} />;
}

export function ToolbarButton({ icon, className, children, ...props }: ToolbarButtonProps) {
  return (
    <BaseToolbar.Button className={clsx("toolbar__button", className)} {...props}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </BaseToolbar.Button>
  );
}

export function ToolbarLink({ className, ...props }: ToolbarLinkProps) {
  return <BaseToolbar.Link className={clsx("toolbar__button", "toolbar__link", className)} {...props} />;
}

export function ToolbarInput({ className, ...props }: ToolbarInputProps) {
  return <BaseToolbar.Input className={clsx("toolbar__input", className)} {...props} />;
}

export function ToolbarSeparator({ className, ...props }: ToolbarSeparatorProps) {
  return <BaseToolbar.Separator className={clsx("toolbar__separator", className)} {...props} />;
}
