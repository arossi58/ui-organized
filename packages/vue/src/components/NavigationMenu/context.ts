import type { InjectionKey, Ref } from "vue";

/**
 * Whether a link sits in a panel. A trigger's item says yes for its slot, which
 * renders only inside its panel; an item with no label says no, so its link
 * sits in the bar like a trigger.
 */
export const NAVIGATION_MENU_PANEL_KEY: InjectionKey<Ref<boolean>> =
  Symbol("navigation-menu-panel");
