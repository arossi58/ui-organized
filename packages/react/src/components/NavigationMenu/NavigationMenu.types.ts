import type * as React from "react";
import type { NavigationMenuColumns } from "@ui-organized/core";
import type { IconComponent, IconName } from "../Icon/Icon.types.js";

export interface NavigationMenuProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "defaultValue" | "dir"
> {
  /** The open item's `value`, or `""` when every panel is closed. Controlled. */
  value?: string;
  /** The item open on first render. Defaults to none. */
  defaultValue?: string;
  /** Called with the open item's `value`, or `""` when the menu closes. */
  onValueChange?: (value: string) => void;
  /** How long a pointer rests on a trigger before its panel opens, in ms. Defaults to 200. */
  openDelay?: number;
  /** How long a panel stays open after the pointer leaves it, in ms. Defaults to 300. */
  closeDelay?: number;
  /** `NavigationMenuItem`s. */
  children?: React.ReactNode;
}

export interface NavigationMenuItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Names the item. Unique within the menu: it ends up in ids. */
  value: string;
  /**
   * The text in the bar. With `href` the item is a link to that page; without
   * it, a trigger that opens a panel holding `children`.
   */
  label?: React.ReactNode;
  /** Makes the item a link in the bar rather than a trigger. */
  href?: string;
  /** With `href`: this item is the current page. */
  current?: boolean;
  /** The trigger can't be used. */
  disabled?: boolean;
  /** The panel's columns of links. Defaults to 1. */
  columns?: NavigationMenuColumns;
  /**
   * A trigger's panel: `NavigationMenuLink`s, usually. With no `label`, the
   * item's only content, such as one `NavigationMenuLink` that renders a router link.
   */
  children?: React.ReactNode;
}

export interface NavigationMenuLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "onSelect"
> {
  href?: string;
  /** This link is the current page. */
  current?: boolean;
  /** In a panel: an icon before the title. Its native name in the active library, or a component. */
  icon?: IconName | IconComponent;
  /** In a panel: a line under the title. */
  description?: React.ReactNode;
  /** Close the menu when the link is followed. Defaults to true. */
  closeOnClick?: boolean;
  /**
   * A router link to render instead of a plain `<a>`, such as `<Link to="/docs" />`.
   * It takes the menu's props and the link's content as its children.
   */
  render?: React.ReactElement;
  /** The link's title. */
  children?: React.ReactNode;
}
