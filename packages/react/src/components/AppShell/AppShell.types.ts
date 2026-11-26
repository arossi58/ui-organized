import type * as React from "react";
import type { AppShellLayout, AppShellResolvedLayout, AppShellScroll } from "@ui-organized/core";

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The header across the top, usually an `AppHeader`. */
  header?: React.ReactNode;
  /** The navigation down the side, usually a `Sidebar`. In the sheet layout it moves into a sheet. */
  sidebar?: React.ReactNode;
  /** The page, rendered in the shell's `<main>`. */
  children?: React.ReactNode;
  /**
   * `auto` (the default) shows the sidebar as a rail beside the page, and in a
   * sheet below `breakpoint`. `rail` and `sheet` force one.
   */
  layout?: AppShellLayout;
  /** With `layout="auto"`: the viewport width, in px, at or below which the sidebar moves into a sheet. Defaults to 900. */
  breakpoint?: number;
  /** Called with the layout in use when it is first known and whenever it changes. */
  onLayoutChange?: (layout: AppShellResolvedLayout) => void;
  /** Whether the sheet is open, in the sheet layout. Controlled. */
  navOpen?: boolean;
  /** The sheet's open state on first render, uncontrolled. Defaults to false. */
  defaultNavOpen?: boolean;
  /** Called when the sheet opens or closes, including when a click in it goes to a page. */
  onNavOpenChange?: (open: boolean) => void;
  /** The sheet's accessible name. Defaults to "Menu". */
  navTitle?: string;
  /** `page` (the default) scrolls the document under a sticky header; `main` scrolls only the main area, inside a parent of fixed height. */
  scroll?: AppShellScroll;
  /** The skip link's text. Defaults to "Skip to content". */
  skipLinkLabel?: string;
  /** The `<main>`'s id, which the skip link targets. Generated when omitted. */
  mainId?: string;
  /** Where the sheet portals to. Defaults to `document.body`. */
  portalContainer?: React.RefObject<HTMLElement | null>;
}

export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** The product's mark, at the start. */
  logo?: React.ReactNode;
  /** Navigation across the header, such as a `NavigationMenu`. Shown in the rail layout only. */
  nav?: React.ReactNode;
  /** Controls at the end, such as search or an account menu. */
  actions?: React.ReactNode;
  /** The menu button's accessible name, in the sheet layout. Defaults to "Open navigation". */
  menuLabel?: string;
}
