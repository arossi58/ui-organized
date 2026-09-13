/**
 * The icon configuration, carried on Vue's provide/inject.
 *
 * React reads this through `useContext` and Svelte through `getContext`; here it
 * is `inject` with a default, so a component rendered outside any provider still
 * gets the shared defaults rather than `undefined`. The config object itself is
 * common to every framework library — see `IconConfig` in @ui-organized/core.
 */

import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue";
import { DEFAULT_ICON_CONFIG, type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";

export type { IconConfig } from "@ui-organized/core";

export type IconConfigRef = ComputedRef<IconConfig<IconComponent>>;

const ICON_CONTEXT_KEY: InjectionKey<IconConfigRef> = Symbol("ui-organized.iconConfig");

export function provideIconConfig(config: IconConfigRef): void {
  provide(ICON_CONTEXT_KEY, config);
}

/**
 * Held as a ref rather than a snapshot so a provider driven by reactive props
 * keeps its consumers current — a theme switcher flipping `style` to "solid"
 * updates every icon already on the page.
 */
export function useIconConfig(): IconConfigRef {
  const fallback = computed(() => DEFAULT_ICON_CONFIG as IconConfig<IconComponent>);
  return inject(ICON_CONTEXT_KEY, fallback);
}
