import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { ContextMenu as BaseContextMenu } from "@base-ui-components/react/context-menu";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type ContextMenuProps = React.ComponentProps<typeof BaseContextMenu.Root>;
export type ContextMenuTriggerProps = React.ComponentProps<typeof BaseContextMenu.Trigger>;
export type ContextMenuRadioGroupProps = React.ComponentProps<typeof BaseContextMenu.RadioGroup>;

export type ContextMenuGroupProps = Omit<
  React.ComponentProps<typeof BaseContextMenu.Group>,
  "className"
> &
  StringClassName;
export type ContextMenuGroupLabelProps = Omit<
  React.ComponentProps<typeof BaseContextMenu.GroupLabel>,
  "className"
> &
  StringClassName;
export type ContextMenuSeparatorProps = Omit<
  React.ComponentProps<typeof BaseContextMenu.Separator>,
  "className"
> &
  StringClassName;

type PositionerProps = React.ComponentProps<typeof BaseContextMenu.Positioner>;
type PortalProps = React.ComponentProps<typeof BaseContextMenu.Portal>;

export interface ContextMenuContentProps
  extends Omit<React.ComponentProps<typeof BaseContextMenu.Popup>, "className">,
    StringClassName {
  /** Gap between the cursor anchor and popup, in px. Defaults to 4. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Offset along the alignment axis, in px. */
  alignOffset?: PositionerProps["alignOffset"];
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}

export interface ContextMenuItemProps
  extends Omit<React.ComponentProps<typeof BaseContextMenu.Item>, "className">,
    StringClassName {
  /** Leading icon. */
  icon?: CanonicalIconName;
  /** Render with destructive (danger) styling. */
  destructive?: boolean;
}

export type ContextMenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof BaseContextMenu.CheckboxItem>,
  "className"
> &
  StringClassName;

export type ContextMenuRadioItemProps = Omit<
  React.ComponentProps<typeof BaseContextMenu.RadioItem>,
  "className"
> &
  StringClassName;
