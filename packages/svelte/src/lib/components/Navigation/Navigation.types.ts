import type { Snippet } from "svelte";
import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "../../icons/registry.js";

export interface NavProviderProps {
  /** Collapse all descendant nav items to an icon-only rail. @default false */
  collapsed?: boolean;
  children?: Snippet;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLDivElement>, "class"> {
  /** Logo / wordmark pinned to the top of the sidebar. A string, or a snippet. */
  logo?: string | Snippet;
  /**
   * Optional compact logo shown when collapsed (e.g. an icon-only mark).
   * Falls back to `logo` when omitted.
   */
  logoCollapsed?: string | Snippet;
  /** Footer region pinned to the bottom, above the auto collapse toggle. */
  footer?: string | Snippet;
  /** Nav items (`NavItem`) — the scrollable middle region. */
  children?: Snippet;
  /** Accessible label for the inner nav landmark. @default "Primary" */
  navLabel?: string;
  /**
   * Allow collapsing to an icon-only rail. When true, a working expand/collapse
   * toggle button is rendered in the footer automatically.
   */
  collapsible?: boolean;
  /** Collapsed state for controlled usage. Bindable: `bind:collapsed`. */
  collapsed?: boolean;
  /** Initial collapsed state for uncontrolled usage. @default false */
  defaultCollapsed?: boolean;
  /** Called with the next collapsed state whenever the toggle is used. */
  onCollapsedChange?: (collapsed: boolean) => void;
  class?: string;
}

export interface NavItemProps extends Omit<HTMLButtonAttributes, "class" | "children"> {
  /** Text label for the page. A string, or a snippet for anything richer. */
  label: string | Snippet;
  /**
   * Optional leading icon, rendered via the Icon component — either a canonical
   * name or a library icon component supplied directly.
   */
  icon?: CanonicalIconName | IconComponent;
  /** Marks this page as the current page — renders the filled, emphasized appearance. */
  selected?: boolean;
  /**
   * Render as an icon-only rail (label hidden, sub-list suppressed). Overrides
   * the value from a surrounding `Sidebar` / `NavProvider`; defaults to it.
   */
  collapsed?: boolean;
  /**
   * Sub-pages shown beneath the item when expanded. Providing children makes the
   * item expandable and renders a caret toggle. Pass `NavSubItem`s here.
   */
  children?: Snippet;
  /** Expanded state for controlled usage. Bindable: `bind:expanded`. */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled usage. @default false */
  defaultExpanded?: boolean;
  /** Called with the next expanded state whenever the caret is toggled. */
  onExpandedChange?: (expanded: boolean) => void;
  class?: string;
}

export interface NavSubItemProps extends Omit<HTMLButtonAttributes, "class" | "children"> {
  /** Text label for the sub-page. A string, or a snippet. */
  label: string | Snippet;
  /** Optional leading icon, rendered via the Icon component. */
  icon?: CanonicalIconName | IconComponent;
  /** Marks this sub-page as the current page. */
  selected?: boolean;
  /**
   * Render as an icon-only rail (label hidden). Overrides the value from a
   * surrounding `Sidebar` / `NavProvider`; defaults to it.
   */
  collapsed?: boolean;
  class?: string;
}
