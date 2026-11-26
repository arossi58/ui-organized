import type { Component } from "vue";
import type { NavigationMenuColumns } from "@ui-organized/core";
import type { IconName } from "../Icon/Icon.types.js";
import type { IconComponent } from "../../icons/registry.js";

export interface NavigationMenuProps {
  /** The open item's `value`, or `""` when every panel is closed. Use `v-model:value`. */
  value?: string;
  /** The item open on first render. Defaults to none. */
  defaultValue?: string;
  /** How long a pointer rests on a trigger before its panel opens, in ms. Defaults to 200. */
  openDelay?: number;
  /** How long a panel stays open after the pointer leaves it, in ms. Defaults to 300. */
  closeDelay?: number;
}

export interface NavigationMenuItemProps {
  /** Names the item. Unique within the menu: it ends up in ids. */
  value: string;
  /**
   * The text in the bar. With `href` the item is a link to that page; without
   * it, a trigger that opens a panel holding the default slot.
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
}

export interface NavigationMenuLinkProps {
  href?: string;
  /** This link is the current page. */
  current?: boolean;
  /** In a panel: an icon before the title. */
  icon?: IconName | IconComponent;
  /** In a panel: a line under the title. */
  description?: string;
  /** Close the menu when the link is followed. Defaults to true. */
  closeOnClick?: boolean;
  /** A router link component to render instead of `<a>`, such as `RouterLink`. Its props go on as attributes. */
  as?: string | Component;
}
