import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";
import {
  APP_SHELL_BREAKPOINT,
  APP_SHELL_CLASS,
  appShellDataLayout,
  appShellNarrowQuery,
  appShellStyles,
  resolveAppShellLayout,
} from "@ui-organized/core";
import { Sheet, SheetContent, SheetTitle } from "../Sheet/index.js";
import { SidebarHostContext, type SidebarHostValue } from "../Navigation/NavContext.js";
import { AppShellContext, type AppShellContextValue } from "./AppShellContext.js";
import { useMediaQuery } from "./useMediaQuery.js";
import type { AppShellProps } from "./AppShell.types.js";
import "@ui-organized/core/components/Button/Button.css";
import "@ui-organized/core/components/AppShell/AppShell.css";

/**
 * An application's frame: `header` across the top, `sidebar` down the side,
 * and the page in a `<main>` beside it, after a skip link to it.
 *
 * Below `breakpoint` the sidebar moves into a sheet from the left, which the
 * header's menu button opens and a click that goes to a page closes. The
 * sheet's root stays mounted in both layouts, so crossing the breakpoint never
 * remounts the page, and the sheet is closed in the same render that drops it.
 *
 * ```tsx
 * <AppShell header={<AppHeader logo={<Logo />} />} sidebar={<Sidebar>…</Sidebar>}>
 *   <PageHeader title="Reports" />
 * </AppShell>
 * ```
 */
export function AppShell({
  header,
  sidebar,
  children,
  layout = "auto",
  breakpoint = APP_SHELL_BREAKPOINT,
  onLayoutChange,
  navOpen,
  defaultNavOpen = false,
  onNavOpenChange,
  navTitle = "Menu",
  scroll = "page",
  skipLinkLabel = "Skip to content",
  mainId,
  portalContainer,
  className,
  ...props
}: AppShellProps) {
  const narrow = useMediaQuery(appShellNarrowQuery(breakpoint), layout === "auto");
  const resolved = resolveAppShellLayout(layout, narrow);
  const dataLayout = appShellDataLayout(layout, narrow);
  // useId's colons are legal in an id but read badly in the skip link's href.
  const generatedId = `app-shell-main-${useId().replace(/:/g, "")}`;
  const main = mainId ?? generatedId;

  const [innerOpen, setInnerOpen] = useState(defaultNavOpen);
  const isOpen = navOpen ?? innerOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (navOpen === undefined) setInnerOpen(next);
      onNavOpenChange?.(next);
    },
    [navOpen, onNavOpenChange],
  );

  // The sheet is shut whenever the layout is a rail, in the same render, so it
  // is never unmounted open. A parent that controls it hears about it below.
  const sheetOpen = resolved === "sheet" && isOpen;
  // Only a change from sheet to rail closes it. The first render of `auto` is
  // a rail before it has measured, and an open sheet asked for then must
  // survive into the sheet layout it is about to become.
  const previousLayout = useRef(resolved);
  useEffect(() => {
    const was = previousLayout.current;
    previousLayout.current = resolved;
    if (was === "sheet" && resolved === "rail" && isOpen) setOpen(false);
  }, [resolved, isOpen, setOpen]);

  const reported = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!dataLayout || reported.current === dataLayout) return;
    reported.current = dataLayout;
    onLayoutChange?.(dataLayout);
  }, [dataLayout, onLayoutChange]);

  const hasSidebar = sidebar != null && sidebar !== false;
  const shell = useMemo<AppShellContextValue>(
    () => ({ layout: resolved, hasSidebar }),
    [resolved, hasSidebar],
  );
  const host = useMemo<SidebarHostValue>(
    () => ({ inSheet: true, onNavigate: () => setOpen(false) }),
    [setOpen],
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={setOpen}>
      <AppShellContext.Provider value={shell}>
        <div
          className={clsx(appShellStyles({ scroll }), className)}
          data-layout={dataLayout}
          {...props}
        >
          <a className={APP_SHELL_CLASS.skip} href={`#${main}`}>
            {skipLinkLabel}
          </a>
          {header}
          <div className={APP_SHELL_CLASS.body}>
            {resolved === "rail" && hasSidebar && (
              <div className={APP_SHELL_CLASS.sidebar}>{sidebar}</div>
            )}
            <main id={main} className={APP_SHELL_CLASS.main} tabIndex={-1}>
              {children}
            </main>
          </div>
          {resolved === "sheet" && hasSidebar && (
            <SheetContent
              side="left"
              size="sm"
              className={APP_SHELL_CLASS.sheet}
              container={portalContainer}
            >
              <SheetTitle className={APP_SHELL_CLASS.sheetTitle}>{navTitle}</SheetTitle>
              <SidebarHostContext.Provider value={host}>{sidebar}</SidebarHostContext.Provider>
            </SheetContent>
          )}
        </div>
      </AppShellContext.Provider>
    </Sheet>
  );
}
