import type { Component } from "vue";
import type { CanonicalIconName } from "@ui-organized/utils";
import type { IconComponent } from "../../icons/registry.js";

export interface NavProviderProps {
  /** Collapse all descendant nav items to an icon-only rail. @default false */
  collapsed?: boolean;
}

export interface SidebarProps {
  /** Accessible label for the inner nav landmark. @default "Primary" */
  navLabel?: string;
  /**
   * Allow collapsing to an icon-only rail. When true, a working expand/collapse
   * toggle button is rendered in the footer automatically.
   */
  collapsible?: boolean;
  /** Collapsed state for controlled usage. Use `v-model:collapsed`. */
  collapsed?: boolean;
  /** Initial collapsed state for uncontrolled usage. @default false */
  defaultCollapsed?: boolean;
}

export interface NavItemProps {
  /**
   * Text label for the page. A string, or a component for anything richer —
   * the same union `Progress` and `Breadcrumb` take.
   */
  label: string | Component;
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
  /** Disables the trigger. */
  disabled?: boolean;
  /** Expanded state for controlled usage. Use `v-model:expanded`. */
  expanded?: boolean;
  /** Initial expanded state for uncontrolled usage. @default false */
  defaultExpanded?: boolean;
}

export interface NavSubItemProps {
  /** Text label for the sub-page. */
  label: string | Component;
  /** Optional leading icon, rendered via the Icon component. */
  icon?: CanonicalIconName | IconComponent;
  /** Marks this sub-page as the current page. */
  selected?: boolean;
  /**
   * Render as an icon-only rail (label hidden). Overrides the value from a
   * surrounding `Sidebar` / `NavProvider`; defaults to it.
   */
  collapsed?: boolean;
  /** Disables the button. */
  disabled?: boolean;
}
