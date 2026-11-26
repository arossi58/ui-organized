import type { InjectionKey } from "vue";
import type { AppShellResolvedLayout } from "@ui-organized/core";

/**
 * What an AppHeader needs from the AppShell around it: whether the sidebar is
 * in a sheet, so it shows the menu button and drops its `nav`. Getter-backed,
 * so a computed in the header tracks the layout.
 */
export interface AppShellContextValue {
  readonly layout: AppShellResolvedLayout;
  readonly hasSidebar: boolean;
}

export const APP_SHELL_KEY: InjectionKey<AppShellContextValue> = Symbol("ui-organized.appShell");
