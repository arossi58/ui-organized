import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface ContextMenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

/** The area that opens the menu on right-click (or long-press). */
export type ContextMenuTriggerProps = React.ComponentPropsWithoutRef<"div">;

export interface ContextMenuContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Gap from the cursor, in px. Defaults to 4. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}

export interface ContextMenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** Stable id for the item; defaults to a generated id. */
  value?: string;
  /** Leading icon. */
  icon?: CanonicalIconName;
  /** Render with destructive (danger) styling. */
  destructive?: boolean;
  disabled?: boolean;
  /** Fired when the item is selected (click or keyboard). */
  onSelect?: () => void;
}

export type ContextMenuSeparatorProps = React.ComponentPropsWithoutRef<"div">;
export type ContextMenuGroupProps = React.ComponentPropsWithoutRef<"div">;
export type ContextMenuGroupLabelProps = React.ComponentPropsWithoutRef<"div">;

export interface ContextMenuRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export interface ContextMenuCheckboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  value?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface ContextMenuRadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  value: string;
  disabled?: boolean;
}
