import { cva, type VariantProps } from "class-variance-authority";

/**
 * A site's top navigation: a row of triggers that each drop a panel of links,
 * with plain links between them.
 *
 * Every panel renders under its own item, inline rather than portalled, and
 * stays in the document while closed (`hidden`), so its links are crawlable
 * and server-rendered. A trigger opens on hover, after a short delay, or on a
 * click; arrow keys move between the triggers and down into a panel.
 */
export const NAVIGATION_MENU_CLASS = {
  root: "navigation-menu",
  list: "navigation-menu__list",
  item: "navigation-menu__item",
  /** A trigger, and a link that sits in the bar beside the triggers. */
  trigger: "navigation-menu__trigger text-default-body-medium",
  chevron: "navigation-menu__chevron",
  link: "navigation-menu__link",
  linkIcon: "navigation-menu__link-icon",
  linkBody: "navigation-menu__link-body",
  linkTitle: "navigation-menu__link-title text-emphasis-body-medium",
  linkDescription: "navigation-menu__link-description text-default-body-small",
} as const;

/** A panel, laid out as a grid of one to three columns of links. */
export const navigationMenuContentStyles = cva("navigation-menu__content", {
  variants: {
    columns: {
      1: "",
      2: "navigation-menu__content--columns-2",
      3: "navigation-menu__content--columns-3",
    },
  },
  defaultVariants: {
    columns: 1,
  },
});

export type NavigationMenuContentVariants = VariantProps<typeof navigationMenuContentStyles>;
export type NavigationMenuColumns = 1 | 2 | 3;

/** The trigger's chevron and a panel link's icon, in px. */
export const NAVIGATION_MENU_CHEVRON_SIZE = 16;
export const NAVIGATION_MENU_LINK_ICON_SIZE = 20;

/** Zag's hover delays, so a menu opens and closes at the same pace in all four libraries. */
export const NAVIGATION_MENU_OPEN_DELAY = 200;
export const NAVIGATION_MENU_CLOSE_DELAY = 300;
