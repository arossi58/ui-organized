import type { InjectionKey } from "vue";

/** Provided by ItemGroup, whose items are its list items. */
export const ITEM_GROUP_KEY: InjectionKey<boolean> = Symbol("item-group");
