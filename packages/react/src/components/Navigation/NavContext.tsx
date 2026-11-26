import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export interface NavContextValue {
  /** When true, nav items render as an icon-only rail (labels hidden). */
  collapsed: boolean;
}

const NavContext = createContext<NavContextValue>({ collapsed: false });

export function useNavContext(): NavContextValue {
  return useContext(NavContext);
}

export interface NavProviderProps {
  /** Collapse all descendant nav items to an icon-only rail. @default false */
  collapsed?: boolean;
  children: ReactNode;
}

/**
 * Shares sidebar-level state with all NavItem / NavSubItem descendants so a
 * single toggle drives every item without prop drilling. Currently carries the
 * collapsed (icon-only rail) flag; the Sidebar container will provide this.
 *
 * @example
 * ```tsx
 * <NavProvider collapsed={isCollapsed}>
 *   <NavItem label="Home" icon="house" />
 * </NavProvider>
 * ```
 */
export function NavProvider({ collapsed = false, children }: NavProviderProps) {
  return (
    <NavContext.Provider value={{ collapsed }}>
      {children}
    </NavContext.Provider>
  );
}

/**
 * What hosts a Sidebar, when something does: an AppShell's sheet.
 *
 * @internal Not exported from the package. AppShell provides it around the
 * sidebar it moves into its sheet: there the sidebar is always expanded, has
 * no collapse toggle (a sheet is not a rail), and calls `onNavigate` when a
 * click in it goes to a page, so the sheet can close. Outside an AppShell
 * nothing provides it and a Sidebar is unchanged.
 */
export interface SidebarHostValue {
  inSheet: boolean;
  onNavigate?: () => void;
}

export const SidebarHostContext = createContext<SidebarHostValue | null>(null);
