import type { AppShellResolvedLayout } from "@ui-organized/core";

/**
 * What an AppHeader needs from the AppShell around it: whether the sidebar is
 * in a sheet, so it shows the menu button and drops its `nav`. A getter-backed
 * object, so a header reading it after the layout changes sees the new value.
 */
export interface AppShellContextValue {
  readonly layout: AppShellResolvedLayout;
  readonly hasSidebar: boolean;
}

export const APP_SHELL_KEY = Symbol("ui-organized.appShell");
