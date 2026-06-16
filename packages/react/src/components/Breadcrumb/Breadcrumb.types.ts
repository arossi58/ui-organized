import type * as React from "react";
import type { CanonicalIconName } from "@ui-organized/utils";

export interface BreadcrumbItem {
  /** Visible label for the crumb. */
  label: React.ReactNode;
  /** Link target. Omit on the current (last) crumb. */
  href?: string;
  /** Optional leading icon. */
  icon?: CanonicalIconName;
}

export interface BreadcrumbProps
  extends Omit<React.ComponentPropsWithRef<"nav">, "children"> {
  /** The crumb trail, ordered from root to current page. */
  items: BreadcrumbItem[];
  /** Custom separator between crumbs. Defaults to a chevron icon. */
  separator?: React.ReactNode;
}
