/**
 * The icon configuration, carried on Svelte context.
 *
 * React reads this through `useContext`; here it is `getContext` behind a
 * function so a component that renders outside any provider still gets the
 * defaults rather than `undefined`. The config object itself is shared with
 * every other framework library — see `IconConfig` in @ui-organized/core.
 */
import { type IconConfig } from "@ui-organized/core";
import type { IconComponent } from "../icons/registry.js";
export type { IconConfig } from "@ui-organized/core";
/**
 * Held as an accessor rather than a plain object so a provider whose props are
 * reactive keeps its consumers up to date — reading `.current` inside a
 * `$derived` re-runs when the provider's own state changes.
 */
export interface IconConfigAccessor {
    readonly current: IconConfig<IconComponent>;
}
export declare function setIconConfig(accessor: IconConfigAccessor): void;
export declare function getIconConfig(): IconConfig<IconComponent>;
//# sourceMappingURL=iconContext.svelte.d.ts.map