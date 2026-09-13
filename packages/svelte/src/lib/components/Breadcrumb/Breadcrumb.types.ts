import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface BreadcrumbItem {
  /**
   * Visible label for the crumb.
   *
   * A string, or a snippet for anything richer — the same union `Progress` takes,
   * and for the same reason: React's `ReactNode` has no Svelte equivalent.
   */
  label: string | Snippet;
  /** Link target. Omit on the current (last) crumb. */
  href?: string;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "class" | "children"> {
  /** The crumb trail, ordered from root to current page. */
  items: BreadcrumbItem[];
  /** Custom separator between crumbs. Defaults to a chevron icon. */
  separator?: string | Snippet;
  class?: string;
}
