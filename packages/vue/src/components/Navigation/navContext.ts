import { computed, inject, provide, type ComputedRef, type InjectionKey } from "vue";

export interface NavContextValue {
  /** When true, nav items render as an icon-only rail (labels hidden). */
  collapsed: boolean;
}

export type NavContextRef = ComputedRef<NavContextValue>;

const NAV_CONTEXT_KEY: InjectionKey<NavContextRef> = Symbol("ui-organized.navContext");

/** Called by a `Sidebar` (or a bare `NavProvider`). */
export function provideNavContext(context: NavContextRef): void {
  provide(NAV_CONTEXT_KEY, context);
}

/**
 * Read by every `NavItem` / `NavSubItem`, so one toggle drives the whole rail
 * without prop drilling.
 *
 * Held as a ref rather than a snapshot, for the same reason the positioning
 * bridge is: a collapse toggle has to reach items that are already on the page,
 * and a plain object captured at setup would leave them expanded forever.
 * `inject` carries a default, so an item rendered outside any sidebar gets the
 * uncollapsed shape rather than `undefined`.
 */
export function useNavContext(): NavContextRef {
  const fallback = computed<NavContextValue>(() => ({ collapsed: false }));
  return inject(NAV_CONTEXT_KEY, fallback);
}
