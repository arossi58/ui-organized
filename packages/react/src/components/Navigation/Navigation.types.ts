import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Logo / wordmark pinned to the top of the sidebar. */
  logo?: React.ReactNode;
  /**
   * Optional compact logo shown when collapsed (e.g. an icon-only mark).
   * Falls back to `logo` when omitted.
   */
  logoCollapsed?: React.ReactNode;
  /** Footer region pinned to the bottom, above the auto collapse toggle. */
  footer?: React.ReactNode;
  /** Nav items (`NavItem`) — the scrollable middle region. */
  children?: React.ReactNode;
  /** Accessible label for the inner nav landmark. @default "Primary" */
  navLabel?: string;
  /**
   * Allow collapsing to an icon-only rail. When true, a working expand/collapse
   * toggle button is rendered in the footer automatically.
   */
  collapsible?: boolean;
  /** Collapsed state for controlled usage. */
  collapsed?: boolean;
  /** Initial collapsed state for uncontrolled usage. @default false */
  defaultCollapsed?: boolean;
  /** Called with the next collapsed state whenever the toggle is used. */
  onCollapsedChange?: (collapsed: boolean) => void;
}

export interface NavItemProps
  extends Omit<React.ComponentPropsWithRef<"button">, "children"> {
  /** Text label for the page. */
  label: React.ReactNode;
  /**
   * Optional leading icon, rendered via the Icon component — either a canonical
   * name or a library icon component supplied directly (e.g. from lucide-react).
   */
  icon?: CanonicalIconName | React.ComponentType<Record<string, unknown>>;
  /** Marks this page as the current page — renders the filled, emphasized appearance. */
  selected?: boolean;
  /**
   * Render as an icon-only rail (label hidden, sub-list suppressed). Overrides
   * the value from a surrounding `NavProvider`; defaults to the provider's value.
   */
  collapsed?: boolean;
  /**
   * Sub-pages shown beneath the item when expanded. Providing children makes the
   * item expandable and renders a caret toggle. Pass `NavSubItem` elements here.
   */
  children?: React.ReactNode;
  /** Expanded state for controlled usage. */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled usage. @default false */
  defaultExpanded?: boolean;
  /** Called with the next expanded state whenever the caret is toggled. */
  onExpandedChange?: (expanded: boolean) => void;
}

export interface NavSubItemProps extends React.ComponentPropsWithRef<"button"> {
  /** Text label for the sub-page. */
  label: React.ReactNode;
  /** Optional leading icon, rendered via the Icon component. */
  icon?: CanonicalIconName;
  /** Marks this sub-page as the current page. */
  selected?: boolean;
  /**
   * Render as an icon-only rail (label hidden). Overrides the value from a
   * surrounding `NavProvider`; defaults to the provider's value.
   */
  collapsed?: boolean;
}
