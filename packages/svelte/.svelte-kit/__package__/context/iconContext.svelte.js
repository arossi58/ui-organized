/**
 * The icon configuration, carried on Svelte context.
 *
 * React reads this through `useContext`; here it is `getContext` behind a
 * function so a component that renders outside any provider still gets the
 * defaults rather than `undefined`. The config object itself is shared with
 * every other framework library — see `IconConfig` in @ui-organized/core.
 */
import { getContext, setContext } from "svelte";
import { DEFAULT_ICON_CONFIG } from "@ui-organized/core";
const ICON_CONTEXT_KEY = Symbol("ui-organized.iconConfig");
export function setIconConfig(accessor) {
    setContext(ICON_CONTEXT_KEY, accessor);
}
export function getIconConfig() {
    const accessor = getContext(ICON_CONTEXT_KEY);
    return accessor?.current ?? DEFAULT_ICON_CONFIG;
}
