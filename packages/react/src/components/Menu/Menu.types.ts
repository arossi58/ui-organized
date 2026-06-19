import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export type MenuSide = "top" | "right" | "bottom" | "left";
export type MenuAlign = "start" | "center" | "end";

export interface MenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. */
  defaultOpen?: boolean;
  /** Callback fired when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export interface MenuTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "value"> {
  /** Project the trigger onto a custom element. */
  render?: React.ReactElement;
}

export interface MenuContentProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: MenuSide;
  /** Alignment along the chosen side. Defaults to 'start'. */
  align?: MenuAlign;
  /** Gap between trigger and popup, in px. Defaults to 4. */
  sideOffset?: number;
  /** Offset along the alignment axis, in px. */
  alignOffset?: number;
  /** Portal container. Defaults to document.body. */
  container?: React.RefObject<HTMLElement | null>;
}

export interface MenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** Stable id for the item; defaults to a generated id. */
  value?: string;
  /** Leading icon. */
  icon?: CanonicalIconName;
  /** Render with destructive (danger) styling. */
  destructive?: boolean;
  /** Disable the item. */
  disabled?: boolean;
  /** Fired when the item is selected (click or keyboard). */
  onSelect?: () => void;
}

export type MenuSeparatorProps = React.ComponentPropsWithoutRef<"div">;
export type MenuGroupProps = React.ComponentPropsWithoutRef<"div">;
export type MenuGroupLabelProps = React.ComponentPropsWithoutRef<"div">;

export interface MenuRadioGroupProps {
  /** Controlled selected value. */
  value?: string;
  /** Fired when the selected value changes. */
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
}

export interface MenuCheckboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** Stable id for the item; defaults to a generated id. */
  value?: string;
  /** Controlled checked state. */
  checked?: boolean;
  /** Fired when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface MenuRadioItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** Value this item selects within its radio group. */
  value: string;
  disabled?: boolean;
}
