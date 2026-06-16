import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { Menu as BaseMenu } from "@base-ui-components/react/menu";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type MenuProps = React.ComponentProps<typeof BaseMenu.Root>;
export type MenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>;
export type MenuRadioGroupProps = React.ComponentProps<typeof BaseMenu.RadioGroup>;
export type MenuGroupProps = Omit<
  React.ComponentProps<typeof BaseMenu.Group>,
  "className"
> &
  StringClassName;
export type MenuGroupLabelProps = Omit<
  React.ComponentProps<typeof BaseMenu.GroupLabel>,
  "className"
> &
  StringClassName;
export type MenuSeparatorProps = Omit<
  React.ComponentProps<typeof BaseMenu.Separator>,
  "className"
> &
  StringClassName;

type PositionerProps = React.ComponentProps<typeof BaseMenu.Positioner>;
type PortalProps = React.ComponentProps<typeof BaseMenu.Portal>;

export interface MenuContentProps
  extends Omit<React.ComponentProps<typeof BaseMenu.Popup>, "className">,
    StringClassName {
  /** Side of the trigger to position against. Defaults to 'bottom'. */
  side?: PositionerProps["side"];
  /** Alignment along the chosen side. Defaults to 'start'. */
  align?: PositionerProps["align"];
  /** Gap between trigger and popup, in px. Defaults to 4. */
  sideOffset?: PositionerProps["sideOffset"];
  /** Offset along the alignment axis, in px. */
  alignOffset?: PositionerProps["alignOffset"];
  /** Portal container. Defaults to document.body. */
  container?: PortalProps["container"];
}

export interface MenuItemProps
  extends Omit<React.ComponentProps<typeof BaseMenu.Item>, "className">,
    StringClassName {
  /** Leading icon. */
  icon?: CanonicalIconName;
  /** Render with destructive (danger) styling. */
  destructive?: boolean;
}

export type MenuCheckboxItemProps = Omit<
  React.ComponentProps<typeof BaseMenu.CheckboxItem>,
  "className"
> &
  StringClassName;

export type MenuRadioItemProps = Omit<
  React.ComponentProps<typeof BaseMenu.RadioItem>,
  "className"
> &
  StringClassName;
