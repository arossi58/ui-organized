import { cva, type VariantProps } from "class-variance-authority";

/**
 * An application's frame: a header across the top, a sidebar down the side,
 * and the page in a `<main>` beside it.
 *
 * Below `breakpoint` the sidebar leaves the page and moves into a sheet from
 * the left, opened by a menu button the header shows only then (the `sheet`
 * layout). Above it the sidebar is a rail beside the page (the `rail` layout).
 * `auto`, the default, picks by the viewport's width once the page is running;
 * on the server and on the first render it is a rail.
 */
export const appShellStyles = cva("app-shell", {
  variants: {
    scroll: {
      page: "app-shell--scroll-page",
      main: "app-shell--scroll-main",
    },
  },
  defaultVariants: {
    scroll: "page",
  },
});

export type AppShellVariants = VariantProps<typeof appShellStyles>;
/** `auto` picks by the viewport; `rail` and `sheet` force one. */
export type AppShellLayout = "auto" | "rail" | "sheet";
export type AppShellResolvedLayout = "rail" | "sheet";
/** `page`: the document scrolls under a sticky header. `main`: only the main area scrolls, inside a frame of fixed height. */
export type AppShellScroll = "page" | "main";

export const APP_SHELL_CLASS = {
  skip: "app-shell__skip text-emphasis-body-medium",
  body: "app-shell__body",
  sidebar: "app-shell__sidebar",
  main: "app-shell__main",
  sheet: "app-shell__sheet",
  sheetTitle: "app-shell__sheet-title",
} as const;

export const APP_HEADER_CLASS = {
  root: "app-header",
  start: "app-header__start",
  /** The menu button: the ghost, icon-only, md Button, as classes, so every library renders the same one. */
  menu: "text-default-body-large btn btn--ghost btn--md btn--icon-only app-header__menu",
  logo: "app-header__logo",
  nav: "app-header__nav",
  actions: "app-header__actions",
} as const;

/** The menu button's icon, the md icon-only Button's. */
export const APP_HEADER_MENU_ICON_SIZE = 20;

/** Below this many pixels of viewport width, `auto` is the `sheet` layout. */
export const APP_SHELL_BREAKPOINT = 900;

/** The media query that means "narrow": at or below `breakpoint`. */
export function appShellNarrowQuery(breakpoint: number = APP_SHELL_BREAKPOINT): string {
  return `(max-width: ${breakpoint}px)`;
}

/**
 * The layout in use. `narrow` is `undefined` until the viewport has been
 * measured, on the server and on the first render, and `auto` is a rail then,
 * so the server and the first client render agree.
 */
export function resolveAppShellLayout(
  layout: AppShellLayout,
  narrow: boolean | undefined,
): AppShellResolvedLayout {
  if (layout !== "auto") return layout;
  return narrow ? "sheet" : "rail";
}

/**
 * The root's `data-layout`: absent while `auto` has not measured, so a
 * stylesheet guard can hide the rail on a narrow screen before the page runs
 * (see AppShell.css), and the resolved layout from then on.
 */
export function appShellDataLayout(
  layout: AppShellLayout,
  narrow: boolean | undefined,
): AppShellResolvedLayout | undefined {
  if (layout === "auto" && narrow === undefined) return undefined;
  return resolveAppShellLayout(layout, narrow);
}
