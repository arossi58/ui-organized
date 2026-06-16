import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";
import { Toolbar as BaseToolbar } from "@base-ui-components/react/toolbar";

/** Restrict Base UI's `className` (string | fn) to a plain string for styled parts. */
type StringClassName = { className?: string };

export type ToolbarProps = Omit<
  React.ComponentProps<typeof BaseToolbar.Root>,
  "className"
> &
  StringClassName;

export type ToolbarGroupProps = Omit<
  React.ComponentProps<typeof BaseToolbar.Group>,
  "className"
> &
  StringClassName;

export interface ToolbarButtonProps
  extends Omit<React.ComponentProps<typeof BaseToolbar.Button>, "className">,
    StringClassName {
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export type ToolbarLinkProps = Omit<
  React.ComponentProps<typeof BaseToolbar.Link>,
  "className"
> &
  StringClassName;

export type ToolbarInputProps = Omit<
  React.ComponentProps<typeof BaseToolbar.Input>,
  "className"
> &
  StringClassName;

export type ToolbarSeparatorProps = Omit<
  React.ComponentProps<typeof BaseToolbar.Separator>,
  "className"
> &
  StringClassName;
