import { getContext, setContext } from "svelte";

export interface NavContextValue {
  /** When true, nav items render as an icon-only rail (labels hidden). */
  collapsed: boolean;
}

/**
 * Held as an accessor rather than a plain object, for the same reason the
 * positioning bridge is: a collapse toggle has to reach items that are already
 * on the page, and a snapshot captured at initialisation would leave them
 * expanded forever.
 */
export interface NavContextAccessor {
  readonly current: NavContextValue;
}

const NAV_CONTEXT_KEY = Symbol("ui-organized.navContext");

/** Called by a `Sidebar` (or a bare `NavProvider`) during initialisation. */
export function setNavContext(accessor: NavContextAccessor): void {
  setContext(NAV_CONTEXT_KEY, accessor);
}

/**
 * Read by every `NavItem` / `NavSubItem`, so one toggle drives the whole rail
 * without prop drilling. An item rendered outside any sidebar gets the
 * uncollapsed shape rather than `undefined`.
 *
 * Returns a live view, not a copy: `collapsed` is a getter that reaches back
 * through the provider's accessor on every read, so an item reading it inside a
 * `$derived` re-runs when the sidebar collapses. Returning `accessor.current`
 * directly would type-check and hand every item the value it had at
 * initialisation — a rail whose labels never hide.
 *
 * Named for React's `useNavContext` rather than Svelte's `getContext` habit,
 * because the two libraries export this under one name and a consumer porting a
 * file between them should not have to look it up. Like every `getContext` call
 * it belongs at the top level of a component's `<script>`.
 */
export function useNavContext(): NavContextValue {
  const accessor = getContext<NavContextAccessor | undefined>(NAV_CONTEXT_KEY);
  return {
    get collapsed() {
      return accessor?.current.collapsed ?? false;
    },
  };
}
