import type { AppShellLayout, AppShellScroll } from "@ui-organized/core";

export interface AppShellProps {
  /** `auto` (the default) is a rail, and a sheet below `breakpoint`. `rail` and `sheet` force one. */
  layout?: AppShellLayout;
  /** With `layout="auto"`: the viewport width, in px, at or below which the sidebar moves into a sheet. Defaults to 900. */
  breakpoint?: number;
  /** Whether the sheet is open, in the sheet layout. Use `v-model:nav-open`. */
  navOpen?: boolean;
  /** The sheet's open state on first render, uncontrolled. Defaults to false. */
  defaultNavOpen?: boolean;
  /** The sheet's accessible name. Defaults to "Menu". */
  navTitle?: string;
  /** `page` (the default) scrolls the document under a sticky header; `main` scrolls only the main area. */
  scroll?: AppShellScroll;
  /** The skip link's text. Defaults to "Skip to content". */
  skipLinkLabel?: string;
  /** The `<main>`'s id, which the skip link targets. Generated when omitted. */
  mainId?: string;
  /** Where the sheet teleports to. Defaults to `body`. */
  portalContainer?: HTMLElement | null;
}

export interface AppHeaderProps {
  /** The menu button's accessible name, in the sheet layout. Defaults to "Open navigation". */
  menuLabel?: string;
}
