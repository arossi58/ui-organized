import type { Component } from "vue";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface BreadcrumbItem {
  /**
   * Visible label for the crumb.
   *
   * A string, or a component for anything richer. React takes a ReactNode here;
   * Vue has no single type covering both, so the union is explicit and the
   * component renders whichever it was given.
   */
  label: string | Component;
  /** Link target. Omit on the current (last) crumb. */
  href?: string;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export interface BreadcrumbProps {
  /** The crumb trail, ordered from root to current page. */
  items: BreadcrumbItem[];
}
