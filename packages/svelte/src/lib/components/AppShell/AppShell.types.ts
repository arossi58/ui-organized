import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { AppShellLayout, AppShellResolvedLayout, AppShellScroll } from "@ui-organized/core";

export interface AppShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  class?: string;
  /** The header across the top, usually an `AppHeader`. */
  header?: Snippet;
  /** The navigation down the side, usually a `Sidebar`. In the sheet layout it moves into a sheet. */
  sidebar?: Snippet;
  /** The page, rendered in the shell's `<main>`. */
  children?: Snippet;
  /** `auto` (the default) is a rail, and a sheet below `breakpoint`. `rail` and `sheet` force one. */
  layout?: AppShellLayout;
  /** With `layout="auto"`: the viewport width, in px, at or below which the sidebar moves into a sheet. Defaults to 900. */
  breakpoint?: number;
  /** Called with the layout in use when it is first known and whenever it changes. */
  onLayoutChange?: (layout: AppShellResolvedLayout) => void;
  /** Whether the sheet is open, in the sheet layout. Bindable: `bind:navOpen`. */
  navOpen?: boolean;
  /** The sheet's open state on first render, uncontrolled. Defaults to false. */
  defaultNavOpen?: boolean;
  /** Called when the sheet opens or closes, including when a click in it goes to a page. */
  onNavOpenChange?: (open: boolean) => void;
  /** The sheet's accessible name. Defaults to "Menu". */
  navTitle?: string;
  /** `page` (the default) scrolls the document under a sticky header; `main` scrolls only the main area. */
  scroll?: AppShellScroll;
  /** The skip link's text. Defaults to "Skip to content". */
  skipLinkLabel?: string;
  /** The `<main>`'s id, which the skip link targets. Generated when omitted. */
  mainId?: string;
  /** Where the sheet portals to. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
}

export interface AppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "class"> {
  class?: string;
  /** The product's mark, at the start. */
  logo?: Snippet;
  /** Navigation across the header, such as a `NavigationMenu`. Shown in the rail layout only. */
  nav?: Snippet;
  /** Controls at the end, such as search or an account menu. */
  actions?: Snippet;
  /** The menu button's accessible name, in the sheet layout. Defaults to "Open navigation". */
  menuLabel?: string;
}
