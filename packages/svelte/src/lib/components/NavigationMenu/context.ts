/**
 * Whether a link sits in a panel. A trigger's item says yes for its children,
 * which are rendered only inside its panel; an item with no label says no, so
 * its link sits in the bar like a trigger.
 */
export const NAVIGATION_MENU_PANEL_KEY = Symbol("navigation-menu-panel");
