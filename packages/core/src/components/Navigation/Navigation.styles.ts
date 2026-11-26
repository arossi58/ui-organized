import { cva, type VariantProps } from "class-variance-authority";

export const navItemStyles = cva("nav-item__trigger", {
  variants: {
    selected: {
      true:  "nav-item__trigger--selected",
      false: "",
    },
    expandable: {
      true:  "nav-item__trigger--expandable",
      false: "",
    },
  },
  defaultVariants: {
    selected:   false,
    expandable: false,
  },
});

export const navSubItemStyles = cva("nav-sub-item", {
  variants: {
    selected: {
      true:  "nav-sub-item--selected",
      false: "",
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export type NavItemVariants = VariantProps<typeof navItemStyles>;
export type NavSubItemVariants = VariantProps<typeof navSubItemStyles>;

/**
 * What a click in a sidebar counts as navigating to a page: a link, a
 * sub-item, or an item with no sub-pages (an item with sub-pages only opens
 * them, and says so with `aria-expanded`). An AppShell's sheet closes on one.
 */
export const SIDEBAR_NAVIGATION_SELECTOR =
  "a[href], .nav-sub-item, .nav-item__trigger:not([aria-expanded])";

/** The slice of a DOM element `isSidebarNavigation` reads; core has no DOM types. */
interface ElementLike {
  closest(selector: string): ElementLike | null;
  matches(selector: string): boolean;
}

/**
 * Whether a click on `target` inside `sidebar` navigates. A disabled control
 * does not, and neither does anything outside the sidebar.
 */
export function isSidebarNavigation(
  target: unknown,
  sidebar: { contains(node: never): boolean },
): boolean {
  if (!target || typeof (target as ElementLike).closest !== "function") return false;
  const control = (target as ElementLike).closest(SIDEBAR_NAVIGATION_SELECTOR);
  if (!control || !sidebar.contains(control as never)) return false;
  return !control.matches(":disabled, [aria-disabled='true']");
}
