import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout orientation. Defaults to 'horizontal'. */
  orientation?: "horizontal" | "vertical";
}

export type ToolbarGroupProps = React.HTMLAttributes<HTMLDivElement>;

export interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export type ToolbarLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;
export type ToolbarInputProps = React.InputHTMLAttributes<HTMLInputElement>;
export type ToolbarSeparatorProps = React.HTMLAttributes<HTMLDivElement>;
