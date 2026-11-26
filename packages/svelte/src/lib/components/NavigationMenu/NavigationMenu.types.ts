import type { Snippet } from "svelte";
import type { HTMLAnchorAttributes, HTMLAttributes } from "svelte/elements";
import type { NavigationMenuColumns } from "@ui-organized/core";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";
import type { ArkForwardable } from "../../types.js";

export interface NavigationMenuProps extends ArkForwardable<
  Omit<HTMLAttributes<HTMLElement>, "class" | "dir">
> {
  class?: string;
  /** The open item's `value`, or `""` when every panel is closed. Bindable: `bind:value`. */
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
  children?: Snippet;
}

export interface NavigationMenuItemProps extends ArkForwardable<
  Omit<HTMLAttributes<HTMLDivElement>, "class">
> {
  class?: string;
  /** Names the item. Unique within the menu: it ends up in ids. */
  value: string;
  /**
   * The text in the bar. With `href` the item is a link to that page; without
   * it, a trigger that opens a panel holding `children`.
   */
  label?: string;
  /** Makes the item a link in the bar rather than a trigger. */
  href?: string;
  /** With `href`: this item is the current page. */
  current?: boolean;
  /** The trigger can't be used. */
  disabled?: boolean;
  /** The panel's columns of links. Defaults to 1. */
  columns?: NavigationMenuColumns;
  /** A trigger's panel, or, with no `label`, the item's only content. */
  children?: Snippet;
}

export interface NavigationMenuLinkProps extends ArkForwardable<
  Omit<HTMLAnchorAttributes, "class">
> {
  class?: string;
  href?: string;
  /** This link is the current page. */
  current?: boolean;
  /** In a panel: an icon before the title. */
  icon?: IconName | IconComponent;
  /** In a panel: a line under the title. */
  description?: string;
  /** Close the menu when the link is followed. Defaults to true. */
  closeOnClick?: boolean;
  /** The link's title. */
  children?: Snippet;
}
