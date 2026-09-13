/**
 * The icon configuration, carried on Svelte context.
 *
 * React reads this through `useContext`; here it is `getContext` behind a
 * function so a component that renders outside any provider still gets the
 * defaults rather than `undefined`. The config object itself is shared with
 * every other framework library — see `IconConfig` in @ui-organized/core.
 */

import { getContext, setContext } from "svelte";
import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";

export type { IconConfig } from "@ui-organized/core";

const ICON_CONTEXT_KEY = Symbol("ui-organized.iconConfig");

/**
 * Held as an accessor rather than a plain object so a provider whose props are
 * reactive keeps its consumers up to date — reading `.current` inside a
 * `$derived` re-runs when the provider's own state changes.
 */
export interface IconConfigAccessor {
  readonly current: IconConfig<IconComponent>;
}

export function setIconConfig(accessor: IconConfigAccessor): void {
  setContext(ICON_CONTEXT_KEY, accessor);
}

export function getIconConfig(): IconConfig<IconComponent> {
  const accessor = getContext<IconConfigAccessor | undefined>(ICON_CONTEXT_KEY);
  return accessor?.current ?? (DEFAULT_ICON_CONFIG as IconConfig<IconComponent>);
}
