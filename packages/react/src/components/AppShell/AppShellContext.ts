import { createContext } from "react";
import type { AppShellResolvedLayout } from "@ui-organized/core";

/**
 * What an AppHeader needs from the AppShell around it: whether the sidebar is
 * in a sheet, so it shows the menu button that opens it and drops its `nav`.
 *
 * @internal Not exported from the package.
 */
export interface AppShellContextValue {
  layout: AppShellResolvedLayout;
  hasSidebar: boolean;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);
